import lint = require('..');

const rules = require('../rules/default.json');
const spec = require('./fixtures/todos.partial-deref.oas2.json');

describe('built-in rules', () => {
  test('load and run the default rule set', () => {
    const linter = new lint.Linter();
    linter.registerRules(rules.rules);
    const results = linter.lint(spec);
    expect(results.length).toBeGreaterThan(0);
  });
});
