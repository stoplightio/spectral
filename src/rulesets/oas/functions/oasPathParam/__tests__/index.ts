import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasPathParam', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'path-params': Object.assign(ruleset.rules.oas2['path-params'], {
              enabled: true,
            }),
          },
        },
      },
    ],
  });

  test('No error if templated path is not used', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo': {
            get: {},
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('Error if no path parameter definition', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo/{bar}': {
            get: {},
          },
        },
      },
    });
    expect(results.length).toEqual(1);
    expect(results[0].path).toEqual(['$', 'paths', '/foo/{bar}']);
    expect(results[0].message).toContain('bar');
  });

  test('No error if path parameter definition is used (at the path level)', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo/{bar}': {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
            get: {},
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('No error if path parameter definition is set (at the operation level)', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo/{bar}': {
            get: {
              parameters: [
                {
                  name: 'bar',
                  in: 'path',
                  required: true,
                },
              ],
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('Error if duplicate path parameters with same name are used', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo/{bar}/{bar}': {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
            get: {},
          },
        },
      },
    });
    expect(results.length).toEqual(1);
    expect(results[0].path).toEqual(['$', 'paths', '/foo/{bar}/{bar}']);
    expect(results[0].message).toContain('bar');
  });

  test('Error if path parameter definition is not required', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo/{bar}': {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: false,
              },
            ],
            get: {},
          },
        },
      },
    });
    expect(results.length).toEqual(1);
    expect(results[0].path).toEqual(['$', 'paths', '/foo/{bar}', 'parameters']);
  });

  test('Error if paths are functionally equivalent', () => {
    const results = s.run({
      spec: 'oas2',
      target: {},
      resTarget: {
        paths: {
          '/foo/{boo}': {
            parameters: [
              {
                name: 'boo',
                in: 'path',
                required: true,
              },
            ],
            get: {},
          },
          '/foo/{bar}': {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
            get: {},
          },
        },
      },
    });
    expect(results.length).toEqual(1);
    expect(results[0].path).toEqual(['$', 'paths']);
  });
});
