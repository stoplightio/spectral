import { join, relative } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { Dictionary } from '@stoplight/types/dist';
import { builders as b, namedTypes as n, visit } from 'ast-types';
import * as fs from 'fs';
import * as recast from 'recast';
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
  processTestBlock(ast.program.body, scenario);
  rewriteImports(ast.program.body, join(SCENARIOS_ROOT, scenarioName));

  return recast.print(ast, { quote: 'single' }).code;
}

function populateAssets(body: n.Program['body'], assets: Input['assets']) {
  if (assets.length === 0) {
    return;
  }

  const node = b.arrayExpression([]);

  (body.find(
    // @ts-ignore
    child => n.VariableDeclaration.check(child) && child.kind === 'const' && child.declarations[0].id.name === 'assets',
    // @ts-ignore
  ) as Optional<n.VariableDeclaration>)?.declarations?.[0].init.arguments.push(node);

  for (const [assetName, fileName] of assets) {
    node.elements.push(b.arrayExpression([b.stringLiteral(assetName), b.stringLiteral(join(FIXTURES_ROOT, fileName))]));
  }
}

function processTestBlock(body: n.Program['body'], scenario: IScenarioFile) {
  const describeNode = body.find(
    child =>
      n.ExpressionStatement.check(child) &&
      n.CallExpression.check(child.expression) &&
      n.Identifier.check(child.expression.callee) &&
      child.expression.callee.name === 'describe',
  );

  if (describeNode === void 0) {
    throw new TypeError('Describe block is missing');
  }
}

function injectConsts(node: n.ASTNode, consts: Dictionary<string>, scenario: IScenarioFile) {
  visit(node, {
    visitStringLiteral(path) {
      const comments = path.node.comments;
      if (comments && comments.length > 0) {
        const expr = parseCommentExpression(comments[comments.length - 1].value);
        if (!Array.isArray(expr) || expr[0] !== '@inject') return false;
        comments.pop();

        if (!(expr[1] in consts)) {
          path.replace(b.unaryExpression('void', b.numericLiteral(0)));
        } else {
          path.node.value = consts[expr[1]];
        }
      }

      return false;
    },

    visitComment(path) {
      const expr = parseCommentExpression(path.value.value);

      if (!Array.isArray(expr) || expr[0] !== '@given') return void this.traverse(path);

      path.parentPath.node.comments.pop();

      try {
        if (evalExpression(expr[1], { ...consts, scenario }) === void 0) {
          path.parentPath.parentPath.replace(b.emptyStatement());
        }
      } catch (ex) {
        console.error(ex);
        return false;
      }

      return void this.traverse(path);
    },
  });
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

function evalExpression(expr: string, scope: object) {
  return Function(
    'scope',
    recast.print(
      b.withStatement(
        b.identifier('scope'),
        b.blockStatement([b.returnStatement(recast.parse(expr).program.body[0].expression)]),
      ),
    ).code,
  )(scope);
}

function rewriteImports(body: n.Program['body'], scenarioFilePath: string) {
  for (const child of body) {
    if (!n.ImportDeclaration.check(child)) continue;

    const source = child.source as n.StringLiteral;

    if (source.value.startsWith('.')) {
      source.value = relative(join(scenarioFilePath, '..'), join(SCENARIOS_ROOT, '..', source.value));
    }
  }
}
