import { Spectral } from 'spectral';

// const defaults = require('../../rules/default.json');
const spec = require('./fixtures/todos.partial-deref.oas2.json');

describe('built-in rules', () => {
  test('load and run the default rule set', () => {
    const s = new Spectral();
    const results = s.apply(spec, 'oas2');
    expect(results.length).toBeGreaterThan(0);
  });
});
