import { RuleCollection } from '../../../types';
import { mergeFunctions } from '../functions';
const nanoid = require('nanoid');

jest.mock('nanoid');

describe('Ruleset functions merging', () => {
  beforeEach(() => {
    let seed = 0;
    (nanoid as jest.Mock).mockImplementation(() => `random-id-${seed++}`);
  });

  it('re-writes function names', () => {
    const target = {};
    const foo = Function();
    const sources = {
      foo,
    };

    const rules: RuleCollection = {
      myRule: {
        given: '',
        then: {
          function: 'foo',
        },
      },
    };

    mergeFunctions(target, sources, rules);

    expect(rules).toHaveProperty('myRule.then.function', 'random-id-0');
    expect(target).toHaveProperty('random-id-0', foo);
  });

  it('overrides existing global function', () => {
    const target = {
      foo: Function(),
    };
    const foo = Function();
    const sources = {
      foo,
    };

    mergeFunctions(target, sources, {});

    expect(target).toHaveProperty('random-id-0', foo);
    expect(target).toHaveProperty('foo', foo);
  });

  it('overrides all function names', () => {
    const target = {
      foo: Function(),
    };
    const foo = Function();
    const bar = Function();
    const sources = {
      foo,
      bar,
    };

    const rules: RuleCollection = {
      myRule: {
        given: '',
        then: [
          {
            function: 'bar',
          },
          {
            function: 'foo',
          },
        ],
      },
    };

    mergeFunctions(target, sources, rules);

    expect(target).toHaveProperty('random-id-0', foo);
    expect(target).toHaveProperty('random-id-1', bar);
  });

  it('does not rewrite function name if function cannot be referenced', () => {
    const target = {};
    const sources = {};

    const rules: RuleCollection = {
      myRule: {
        given: '',
        then: {
          function: 'bar',
        },
      },
    };

    mergeFunctions(target, sources, rules);
    expect(rules).toHaveProperty('myRule.then.function', 'bar');
  });
});
