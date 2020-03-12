import { RuleCollection } from '../../../types';
import { RulesetFunctionCollection } from '../../../types/ruleset';
import { mergeFunctions } from '../functions';
const nanoid = require('nanoid/non-secure');

jest.mock('nanoid/non-secure');

describe('Ruleset functions merging', () => {
  beforeEach(() => {
    let seed = 0;
    (nanoid as jest.Mock).mockImplementation(() => `random-id-${seed++}`);
  });

  it('re-writes function names', () => {
    const target = {};
    const sources: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'foo()',
        schema: null,
        source: null,
      },
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
    expect(target).toHaveProperty('random-id-0', {
      name: 'foo',
      code: 'foo()',
      schema: null,
      source: null,
    });
  });

  it('overrides existing global function', () => {
    const target: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'foo()',
        schema: null,
        source: null,
      },
    };
    const sources: RulesetFunctionCollection = {
      foo: {
        name: 'foo.c',
        code: 'foo.a()',
        schema: null,
        source: 'foo',
      },
    };

    mergeFunctions(target, sources, {});

    expect(target).toHaveProperty('random-id-0', {
      name: 'foo.c',
      code: 'foo.a()',
      schema: null,
      source: 'foo',
    });
    expect(target).toHaveProperty('foo', {
      name: 'foo.c',
      ref: 'random-id-0',
      schema: null,
      source: 'foo',
    });
  });

  it('overrides all function names', () => {
    const target: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'foo()',
        schema: null,
        source: null,
      },
    };

    const sources: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'a.foo.c();',
        schema: null,
        source: null,
      },
      bar: {
        name: 'bar',
        code: 'bar()',
        schema: null,
        source: null,
      },
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

    expect(target).toHaveProperty('random-id-0', {
      name: 'foo',
      code: 'a.foo.c();',
      schema: null,
      source: null,
    });
    expect(target).toHaveProperty('random-id-1', {
      name: 'bar',
      code: 'bar()',
      schema: null,
      source: null,
    });
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
