import { basename, join, relative } from '@stoplight/path';
import { Dictionary, Optional } from '@stoplight/types';
import { builders as b, namedTypes as n, visit } from 'ast-types';
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
  // todo: parse once and mutate?
  const ast = recast.parse(template, {
    parser: require('recast/parsers/typescript'),
  }) as n.File;

  injectConsts(
    ast,
    {
      SPECTRAL_BIN,
      SCENARIO_NAME: scenarioName,
      SCENARIO_FILE_PATH: join(SCENARIOS_ROOT, scenarioName),
      TEST_NAME: scenario.test,
    },
    scenario,
  );

  populateAssets(ast.program.body, assets);
  rewriteImports(ast.program.body, join(SCENARIOS_ROOT, scenarioName));

  return recast.print(ast, { quote: 'single' }).code;
}

function populateAssets(body: n.Program['body'], assets: Input['assets']) {
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

const exprCache = new WeakMap<vm.Context, Dictionary<Function, string>>();

function injectConsts(node: n.ASTNode, consts: Dictionary<string>, scenario: IScenarioFile) {
  const sandbox = vm.createContext({});

  exprCache.set(sandbox, {});

  visit(node, {
    visitComment(path) {
      const expr = parseCommentExpression(path.value.value);

      if (!Array.isArray(expr)) return void this.traverse(path);

      path.parentPath.node.comments.pop();

      const parentPath = path.parentPath.parentPath;

      switch (expr[0]) {
        case '@inject':
          if (!(expr[1] in consts)) {
            parentPath.replace(b.unaryExpression('void', b.numericLiteral(0)));
          } else if (n.StringLiteral.check(parentPath.node)) {
            parentPath.node.value = consts[expr[1]];
          } else {
            throw new Error('Could not inject string. Make sure to place the comment before the string');
          }

          break;
        case '@given':
          if (!evalExpression(expr[1], { ...consts, scenario }, sandbox)) {
            path.parentPath.parentPath.replace(b.emptyStatement());
          }

          break;
        default:
          throw new Error('Unknown keyword');
      }

      return void this.traverse(path);
    },
  });

  exprCache.delete(sandbox);
}

function parseCommentExpression(expr: string): undefined | null | [string, string] {
  expr = expr.trim();
  const spaceMatch = /\s/.exec(expr);

  if (spaceMatch === null) return;

  const keyword = expr.slice(0, spaceMatch.index);
  if (!keyword.startsWith('@')) {
    return;
  }

  return [keyword, expr.slice(spaceMatch.index).trimLeft()];
}

function evalExpression(expr: string, scope: object, context: vm.Context) {
  const cached = exprCache.get(context)!;

  if (expr in cached) {
    return cached[expr](scope);
  }

  const fn = vm.compileFunction(
    recast.print(
      b.withStatement(
        b.identifier('scope'),
        b.blockStatement([b.returnStatement(recast.parse(expr).program.body[0].expression)]),
      ),
    ).code,
    ['scope'],
    {
      parsingContext: context,
    },
  );

  cached[expr] = fn;

  return fn(scope);
}

function rewriteImports(body: n.Program['body'], scenarioFilePath: string) {
  for (const child of body) {
    if (!n.ImportDeclaration.check(child)) continue;

    // typings are tad incorrect here, since ModuleSpecifier must be a StringLiteral, see https://tc39.es/ecma262/#sec-imports
    const source = child.source as n.StringLiteral;

    if (source.value.startsWith('.')) {
      source.value = relative(join(scenarioFilePath, '..'), join(SCENARIOS_ROOT, '..', basename(source.value)));
    }
  }
}
