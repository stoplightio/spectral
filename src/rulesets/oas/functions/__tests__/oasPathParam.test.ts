import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { rules } from '../../index.json';
import oasPathParam from '../oasPathParam';

describe('oasPathParam', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setFunctions({ oasPathParam });
  s.setRules({
    'path-params': Object.assign(rules['path-params'], {
      recommended: true,
      severity: DiagnosticSeverity.Error, // TODO this should not need to be here
      type: RuleType[rules['path-params'].type],
    }),
  });

  test('No error if templated path is not used', async () => {
    const results = s.run({
      swagger: '2.0',
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
      swagger: '2.0',
      paths: {
        '/foo/{bar}': {
          get: {},
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'path-params',
        message: 'The path `/foo/{bar}` uses a parameter `{bar}` that does not have a corresponding definition.',
        path: ['paths', '/foo/{bar}'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('No error if path parameter definition is used (at the path level)', async () => {
    const results = s.run({
      swagger: '2.0',
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
      swagger: '2.0',
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
      swagger: '2.0',
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
      swagger: '2.0',
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
      expect.objectContaining({
        code: 'path-params',
        message: `The path \`/foo/{bar}/{bar}\` uses the parameter \`{bar}\` multiple times. Path parameters must be unique.`,
        path: ['paths', '/foo/{bar}/{bar}'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('Error if $ref path parameter definition is not required', async () => {
    const results = await s.run({
      swagger: '2.0',
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
      expect.objectContaining({
        code: 'path-params',
        message: `Path parameter \`bar\` must have a \`required\` property that is set to \`true\`.`,
        path: ['paths', '/foo/{bar}', 'parameters'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('Error if paths are functionally equivalent', async () => {
    const results = await s.run({
      swagger: '2.0',
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
      expect.objectContaining({
        code: 'path-params',
        message: `The paths \`/foo/{boo}\` and \`/foo/{bar}\` are equivalent.`,
        path: ['paths'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });
});
