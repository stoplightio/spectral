import { RuleCollection } from '../../../types';
import { RulesetFunctionCollection } from '../../../types/ruleset';
import { mergeFunctions } from '../functions';

jest.mock('nanoid/non-secure');

describe('Ruleset functions merging', () => {
  it('re-writes function names', () => {
    const target = {};
    const sources: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'foo()',
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
      source: null,
    });
  });

  it('overrides existing global function', () => {
    const target: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'foo()',
        source: null,
      },
    };
    const sources: RulesetFunctionCollection = {
      foo: {
        name: 'foo.c',
        code: 'foo.a()',
        source: 'foo',
      },
    };

    mergeFunctions(target, sources, {});

    expect(target).toHaveProperty('random-id-0', {
      name: 'foo.c',
      code: 'foo.a()',
      source: 'foo',
    });
    expect(target).toHaveProperty('foo', {
      name: 'foo.c',
      ref: 'random-id-0',
      source: 'foo',
    });
  });

  it('overrides all function names', () => {
    const target: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'foo()',
        source: null,
      },
    };

    const sources: RulesetFunctionCollection = {
      foo: {
        name: 'foo',
        code: 'a.foo.c();',
        source: null,
      },
      bar: {
        name: 'bar',
        code: 'bar()',
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
      source: null,
    });
    expect(target).toHaveProperty('random-id-1', {
      name: 'bar',
      code: 'bar()',
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
