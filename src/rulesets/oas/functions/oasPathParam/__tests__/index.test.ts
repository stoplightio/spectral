import { RuleType, Spectral } from '../../../../../index';
import { commonOasFunctions } from '../../../index';

import { rules } from '../../../ruleset.json';

const ruleset = { functions: commonOasFunctions(), rules };

describe('oasPathParam', () => {
  const s = new Spectral();
  s.addFunctions(ruleset.functions || {});
  s.addRules({
    'path-params': Object.assign(ruleset.rules['path-params'], {
      enabled: true,
      type: RuleType[ruleset.rules['path-params'].type],
    }),
  });

  test('No error if templated path is not used', async () => {
    const results = s.run({
      paths: {
        '/foo': {
          get: {},
        },
      },
    });
    expect(results).resolves.toHaveLength(0);
  });

  test('Error if no path parameter definition', async () => {
    const results = await s.run({
      paths: {
        '/foo/{bar}': {
          get: {},
        },
      },
    });
    expect(results).toMatchSnapshot();

    expect(results[0].path).toEqual(['paths', '/foo/{bar}']);
    expect(results[0].message).toContain('bar');
  });

  test('No error if path parameter definition is used (at the path level)', async () => {
    const results = s.run({
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
    });
    expect(results).resolves.toHaveLength(0);
  });

  test('No error if $ref path parameter definition is used (at the path level)', async () => {
    const results = s.run({
      paths: {
        '/foo/{bar}': {
          parameters: [
            {
              $ref: '#/definitions/barParam',
            },
          ],
          get: {},
        },
      },
      definitions: {
        barParam: {
          name: 'bar',
          in: 'path',
          required: true,
        },
      },
    });
    expect(results).resolves.toHaveLength(0);
  });

  test('No error if path parameter definition is set (at the operation level)', async () => {
    const results = s.run({
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
    });
    expect(results).resolves.toHaveLength(0);
  });

  test('Error if duplicate path parameters with same name are used', async () => {
    const results = await s.run({
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
    });
    expect(results).toMatchSnapshot();

    expect(results[0].path).toEqual(['paths', '/foo/{bar}/{bar}']);
    expect(results[0].message).toContain('bar');
  });

  test('Error if $ref path parameter definition is not required', async () => {
    const results = await s.run({
      paths: {
        '/foo/{bar}': {
          parameters: [
            {
              $ref: '#/definitions/barParam',
            },
          ],
          get: {},
        },
      },
      definitions: {
        barParam: {
          name: 'bar',
          in: 'path',
          required: false,
        },
      },
    });
    expect(results).toMatchSnapshot();

    expect(results[0].path).toEqual(['paths', '/foo/{bar}', 'parameters']);
  });

  test('Error if paths are functionally equivalent', async () => {
    const results = await s.run({
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
    });
    expect(results).toMatchSnapshot();

    expect(results[0].path).toEqual(['paths']);
  });
});
