import { DiagnosticSeverity } from '@stoplight/types';
import { Document, Parsers, RuleType, Spectral } from '../../../../index';
import { rules } from '../../index.json';
import oasPathParam from '../oasPathParam';

describe('oasPathParam', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.setFunctions({ oasPathParam });
    s.setRules({
      'path-params': Object.assign(rules['path-params'], {
        recommended: true,
        type: RuleType[rules['path-params'].type],
      }),
    });
  });

  test('No error if templated path is not used', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {},
        },
      },
    });

    expect(results).toHaveLength(0);
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
        message: 'The operation does not define the parameter `{bar}` expected by path `/foo/{bar}`.',
        path: ['paths', '/foo/{bar}', 'get'],
        resolvedPath: ['paths', '/foo/{bar}', 'get'],
        range: {
          end: {
            character: 15,
            line: 3,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  test('No error if path parameter definition is used (at the path level)', async () => {
    const results = await s.run({
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

    expect(results).toHaveLength(0);
  });

  test('No error if $ref path parameter definition is used (at the path level)', async () => {
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
          required: true,
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('No error if path parameter definition is set (at the operation level)', async () => {
    const results = await s.run({
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

    expect(results).toHaveLength(0);
  });

  test('No errors if operation is a not a standard HTTP operation.', async () => {
    const results = await s.run({
      paths: {
        '/foo/{bar}': {
          'x-not-a-standard-operation': {},
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('Error if path parameter definition is set (at the operation level) for a method, but forgotten for another one', async () => {
    const results = await s.run({
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
          put: {},
        },
      },
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'path-params',
        message: 'The operation does not define the parameter `{bar}` expected by path `/foo/{bar}`.',
        path: ['paths', '/foo/{bar}', 'put'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
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
        message: `The path \`/foo/{bar}/{bar}\` uses the parameter \`{bar}\` multiple times. Path parameters must be unique.`,
        path: ['paths', '/foo/{bar}/{bar}'],
        resolvedPath: ['paths', '/foo/{bar}/{bar}'],
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
        message: `Path parameter \`bar\` must have a \`required\` property that is set to \`true\`.`,
        path: ['paths', '/foo/{bar}', 'parameters', '0'],
        resolvedPath: ['paths', '/foo/{bar}', 'parameters', '0'],
        range: {
          end: {
            character: 42,
            line: 5,
          },
          start: {
            character: 8,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  test('Error if $ref operation parameter definition is not required', async () => {
    const results = await s.run({
      paths: {
        '/foo/{bar}': {
          get: {
            parameters: [
              {
                $ref: '#/definitions/barParam',
              },
            ],
          },
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
        path: ['paths', '/foo/{bar}', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('Error if paths are functionally equivalent', async () => {
    const results = await s.run(
      new Document(
        `{
  "paths": {
    "/foo/{boo}": {
      "parameters": [
        {
          "name": "boo",
          "in": "path",
          "required": true
        }
      ],
      "get": {}
    },
    "/foo/{bar}": {
      "parameters": [
        {
          "name": "bar",
          "in": "path",
          "required": true
        }
      ],
      "get": {}
    }
  }
}`,
        Parsers.Json,
      ),
    );

    expect(results).toEqual([
      {
        code: 'path-params',
        message: `The paths \`/foo/{boo}\` and \`/foo/{bar}\` are equivalent.`,
        path: ['paths', '/foo/{bar}'],
        resolvedPath: ['paths', '/foo/{bar}'],
        range: {
          end: {
            character: 5,
            line: 21,
          },
          start: {
            character: 18,
            line: 12,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  test('Error if path parameter definition is set (at the global and/or operation level), but unused', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          parameters: [
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
          ],
          get: {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
          },
          put: {
            parameters: [
              {
                name: 'baz',
                in: 'path',
                required: true,
              },
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'path-params',
        message: 'Parameter `boo` is not used in the path `/foo`.',
        path: ['paths', '/foo', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'path-params',
        message: 'Parameter `bar` is not used in the path `/foo`.',
        path: ['paths', '/foo', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'path-params',
        message: 'Parameter `baz` is not used in the path `/foo`.',
        path: ['paths', '/foo', 'put', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'path-params',
        message: 'Parameter `qux` is not used in the path `/foo`.',
        path: ['paths', '/foo', 'put', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('Error if path parameter are defined multiple times', async () => {
    const results = await s.run({
      paths: {
        '/foo/{boo}/{bar}/{qux}': {
          parameters: [
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
            {
              name: 'bar',
              in: 'path',
              required: true,
            },
          ],
          get: {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
            ],
          },
          put: {
            parameters: [
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'path-params',
        message: 'Path parameter `boo` is defined multiple times. Path parameters must be unique.',
        path: ['paths', '/foo/{boo}/{bar}/{qux}', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'path-params',
        message: 'Path parameter `bar` is defined multiple times. Path parameters must be unique.',
        path: ['paths', '/foo/{boo}/{bar}/{qux}', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'path-params',
        message: 'Path parameter `qux` is defined multiple times. Path parameters must be unique.',
        path: ['paths', '/foo/{boo}/{bar}/{qux}', 'put', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('No error if two parameters bear the same name but target different locations', async () => {
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
          get: {
            parameters: [
              {
                name: 'boo',
                in: 'header',
              },
            ],
          },
        },
      },
    });

    expect(results).toEqual([]);
  });
});
