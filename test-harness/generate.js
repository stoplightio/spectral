#!/usr/bin/env node
/**
 * Note, we could do everything in the first pass, yet in order to increase the readability, let's traverse the tree slightly more often.
 */
const recast = require('recast');
const { builders: b, namedTypes: n, visit } = require('ast-types');
const fs = require('fs');
const path = require('@stoplight/path');
const uniqueSlug = require('unique-slug');
const fg = require('fast-glob');
const { parseScenarioFile } = require('./helpers');

const SCENARIOS_ROOT = path.join(__dirname, './scenarios');
const TESTS_ROOT = path.join(__dirname, './__tests__');
const FIXTURES_ROOT = path.join(TESTS_ROOT, './__fixtures__');
const SPECTRAL_BIN = path.join(__dirname, '../binaries/spectral');

const template =  fs.readFileSync(path.join(__dirname, './codegen/template.ts'), 'utf8');

try {
  fs.mkdirSync(TESTS_ROOT);
} catch (ex) {
  if (ex.errno !== -17) {
    throw ex;
  }
}

try {
  fs.mkdirSync(FIXTURES_ROOT);
} catch (ex) {
  if (ex.errno !== -17) {
    throw ex;
  }
}


(async () => {
  const stream = fg.stream('**/*.scenario', { cwd: SCENARIOS_ROOT });

  for await (const entry of stream) {
    const scenarioPath = path.join(SCENARIOS_ROOT, entry);
    const source = await fs.promises.readFile(scenarioPath, 'utf8');
    const scenario = parseScenarioFile(source);
    const assets = scenario.assets === void 0 ? [] : await writeAssets(scenario.assets);


    // todo: parse once and mutate
    const ast = recast.parse(template,  {
      parser: require('recast/parsers/typescript'),
    });

    const testFilename = `${path.basename(entry, true)}.test.ts`;
    const testDirname = path.dirname(entry);
    let testRoot = TESTS_ROOT;

    if (testDirname !== '.') {
      testRoot = path.join(TESTS_ROOT, testDirname);
      try {
        await fs.promises.mkdir(testRoot);
      } catch (ex) {
        if (ex.errno !== -17) {
          throw ex;
        }
      }
    }

    populateAssets(ast, assets);
    injectScenarioName(ast, entry);
    // evaluateScenarioMemberExpressions(ast, scenario);
    injectFilepath(ast, scenarioPath);
    injectSpectralBin(ast, SPECTRAL_BIN);
    console.log(path.relative(testRoot, path.join(__dirname, 'helpers')));

    await fs.promises.writeFile(path.join(testRoot, testFilename), recast.print(ast, { quote: 'single' }).code);
  }
})();

function getProgramBody(ast) {
  return ast.program.body;
}

function getDescribe(ast) {
  return getProgramBody(ast).find(child =>
    n.ExpressionStatement.check(child) && n.CallExpression.check(child.expression) && child.expression.callee.name === 'describe'
  );
}

async function writeAssets(assets) {
  const list = [];
  const promises = [];

  for (const [name, content] of assets) {
    const filename = uniqueSlug();
    list.push([name, filename]);
    promises.push(fs.promises.writeFile(path.join(FIXTURES_ROOT, filename), content));
  }

  await Promise.all(promises);
  return list;
}

function populateAssets(ast, assets) {
  if (assets.length === 0) {
    return;
  }

  const node = b.arrayExpression([]);

  getProgramBody(ast)
    .find(
      child => isVariableDeclaration(child) && child.kind === 'const' && child.declarations[0].id.name === 'assets',
    )
    .declarations[0]
    .init
    .arguments
    .push(node);

  for (const [assetName, fileName] of assets) {
    node.elements.push(
      b.arrayExpression([
        b.stringLiteral(assetName),
        b.stringLiteral(path.join(FIXTURES_ROOT, fileName)),
      ]),
    );
  }
}

// VariableDeclaration

function injectScenarioName(ast, scenario) {
  getDescribe(ast).expression.arguments[0] = b.stringLiteral(scenario);
}

function injectFilepath(ast, name) {
  for (const child of getProgramBody(ast)) {
    if (n.VariableDeclaration.check(child) && child.declarations.length > 0 && child.declarations[0].id.name === 'scenarioFilepath') {
      child.declarations[0].init = b.stringLiteral(name);
    }
  }
}

function injectSpectralBin(ast, name) {
  for (const child of getProgramBody(ast)) {
    if (n.VariableDeclaration.check(child) && child.declarations.length > 0 && child.declarations[0].id.name === 'spectralBin') {
      child.declarations[0].init = b.stringLiteral(name);
    }
  }
}

function evaluateScenarioMemberExpressions(ast, scenario) {
  let bailedOut = false;
  const nodes = [];

  // dry-run
  visit(getDescribe(ast), {
    bailout() {
      bailedOut = true;
      return this.abort();
    },

    visitMemberExpression(path) {
      const { value: node } = path;

      if (!n.Identifier.check(node.object) || node.object.name !== 'scenario') {
        return void this.traverse(path);
      }

      if (node.computed || node.optional) {
        return void this.bailout(path);
      }

      if (!(node.property.name in scenario)) {
        // we could leave it undefined, but let's make TS complain about it
        return void this.bailout(path);
      }


      if (!n.MemberExpression.check(path.parentPath.value)) { // todo: check each node?
        return void this.bailout(path);
      }

      // this.abort();

      return false;
    },
  });
}

function eliminateDeadCode() {
  getDescribe(ast).expression.arguments[1].find(child => (
    child.type === 'ExpressionStatement' && child.expression.type === 'CallExpression' && child.expression.callee.name === 'test'
  ));
  // look only for dead code inside of test()
}

function isVariableDeclaration(node) {
  return node.type === 'VariableDeclaration';
}
