import { basename, join, relative } from '@stoplight/path';
import { Dictionary, Optional } from '@stoplight/types';
import { builders as b, namedTypes as n, visit } from 'ast-types';
import * as k from 'ast-types/gen/kinds';
import * as fs from 'fs';
import * as recast from 'recast';
import * as vm from 'vm';
import { IScenarioFile } from '../helpers';
import { FIXTURES_ROOT, SCENARIOS_ROOT, SPECTRAL_BIN } from './consts';

const template = fs.readFileSync(join(__dirname, './templates/suite.ts'), 'utf8');

export type Input = {
  scenarioName: string;
  assets: string[][];
  scenario: IScenarioFile;
};

export function generate({ assets, scenario, scenarioName }: Input) {
  const ast = recast.parse(template, {
    parser: require('recast/parsers/typescript'),
  }) as n.File;

  processComments(
    ast,
    {
      SPECTRAL_BIN,
      SCENARIO_NAME: scenarioName,
      SCENARIO_FILE_PATH: join(SCENARIOS_ROOT, scenarioName),
      SCENARIOS_ROOT,
      TEST_NAME: scenario.test,
    },
    scenario,
  );

  populateAssets(ast.program.body, assets);
  rewriteImports(ast.program.body, join(SCENARIOS_ROOT, scenarioName));

  return recast.print(ast, { quote: 'single' }).code;
}

function populateAssets(body: k.StatementKind[], assets: Input['assets']) {
  if (assets.length === 0) {
    return;
  }

  const node = b.arrayExpression([]);

  const variableDeclaration = body.find(child => {
    if (!n.VariableDeclaration.check(child) || child.kind !== 'const' || child.declarations.length === 0) return false;
    const declarator = child.declarations[0];

    return (
      n.VariableDeclarator.check(declarator) && n.Identifier.check(declarator.id) && declarator.id.name === 'assets'
    );
  }) as Optional<n.VariableDeclaration>;

  if (!variableDeclaration) {
    throw new Error('Assets could not be populated');
  }

  const variableDeclarator = variableDeclaration.declarations[0] as n.VariableDeclarator;

  if (!n.NewExpression.check(variableDeclarator.init)) {
    throw new Error('Assets could not be populated');
  }

  variableDeclarator.init.arguments.push(node);

  for (const [assetName, fileName] of assets) {
    node.elements.push(b.arrayExpression([b.stringLiteral(assetName), b.stringLiteral(join(FIXTURES_ROOT, fileName))]));
  }
}

function processComments(node: n.ASTNode, consts: Dictionary<string>, scenario: IScenarioFile) {
  const sandbox = vm.createContext({});

  visit(node, {
    visitComment(path) {
      const expr = parseComment(path.value.value);

      if (!Array.isArray(expr)) return void this.traverse(path);

      path.parentPath.node.comments.pop();

      const parentPath = path.parentPath.parentPath;

      switch (expr[0]) {
        case 'inject':
          if (!n.Identifier.check(expr[1]) || !(expr[1].name in consts)) {
            parentPath.replace(b.unaryExpression('void', b.numericLiteral(0)));
          } else if (n.Literal.check(parentPath.node)) {
            parentPath.node.value = consts[expr[1].name];
          } else {
            throw new Error('Could not inject string. Make sure to place the comment before the literal');
          }

          break;
        case 'given':
          if (!evalExpression(expr[1] as k.ExpressionKind, { ...consts, scenario }, sandbox)) {
            path.parentPath.parentPath.replace(b.emptyStatement());
          }

          break;
        default:
          throw new Error('Unknown keyword');
      }

      return void this.traverse(path);
    },
  });
}

function parseComment(expr: string): Optional<[string, k.ExpressionKind]> {
  try {
    const body = recast.parse(expr).program.body;
    if (body.length === 0 || !n.LabeledStatement.check(body[0])) return;

    const [
      {
        label: { name: keyword },
        body: { expression },
      },
    ] = body;

    return [keyword, expression];
  } catch {
    return;
  }
}

function evalExpression(expr: k.ExpressionKind, scope: object, context: vm.Context) {
  return vm.compileFunction(
    recast.print(b.withStatement(b.identifier('scope'), b.blockStatement([b.returnStatement(expr)]))).code,
    ['scope'],
    {
      parsingContext: context,
    },
  )(scope);
}

function rewriteImports(body: k.StatementKind[], scenarioFilePath: string) {
  for (const child of body) {
    if (!n.ImportDeclaration.check(child)) continue;

    // typings are tad incorrect here, since ModuleSpecifier must be a StringLiteral, see https://tc39.es/ecma262/#sec-imports
    const source = child.source as n.StringLiteral;

    if (source.value.startsWith('.')) {
      source.value = relative(join(scenarioFilePath, '..'), join(SCENARIOS_ROOT, '..', basename(source.value)));
    }
  }
}
