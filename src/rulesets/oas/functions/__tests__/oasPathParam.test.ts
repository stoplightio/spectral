import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { rules } from '../../index.json';
import oasPathParam from '../oasPathParam';

describe('oasPathParam', () => {
  const s = new Spectral();
  s.setFunctions({ oasPathParam });
  s.setRules({
    'path-params': Object.assign(rules['path-params'], {
      recommended: true,
      type: RuleType[rules['path-params'].type],
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
    expect(results).toEqual([
      {
        code: 'path-params',
        message:
          'The path "**/foo/{bar}**" uses a parameter "**{bar}**" that does not have a corresponding definition.\n\nTo fix, add a path parameter with the name "**bar**".',
        path: ['paths', '/foo/{bar}'],
        range: {
          end: {
            character: 15,
            line: 3,
          },
          start: {
            character: 17,
            line: 2,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
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
    expect(results).toEqual([
      {
        code: 'path-params',
        message: `The path "**/foo/{bar}/{bar}**" uses the parameter "**{bar}**" multiple times.\n
Path parameters must be unique.\n
To fix, update the path so that all parameter names are unique.`,
        path: ['paths', '/foo/{bar}/{bar}'],
        range: {
          end: {
            character: 15,
            line: 10,
          },
          start: {
            character: 23,
            line: 2,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
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

    expect(results).toEqual([
      {
        code: 'path-params',
        message: `Path parameter \"**bar**\" must have a \`required\` that is set to \`true\`.\n\nTo fix, mark this parameter as required.`,
        path: ['paths', '/foo/{bar}', 'parameters'],
        range: {
          end: {
            character: 42,
            line: 5,
          },
          start: {
            character: 19,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
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

    expect(results).toEqual([
      {
        code: 'path-params',
        message: `The paths \"**/foo/{boo}**\" and \"**/foo/{bar}**\" are equivalent.\n\nTo fix, remove one of the paths or merge them together.`,
        path: ['paths'],
        range: {
          end: {
            character: 15,
            line: 20,
          },
          start: {
            character: 10,
            line: 1,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });
});
