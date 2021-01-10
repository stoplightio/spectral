import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '../../../../spectral';

export default (s: Spectral, oasVersion: number) => {
  test('should work for shared level parameters', async () => {
    const results = await s.run({
      swagger: '2.0',
      parameters: {
        limit: {
          name: 'limit',
          in: 'query',
          description: 'This is how it works.',
          type: 'integer',
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('should work for top level path parameters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'This is how it works.',
              type: 'integer',
            },
          ],
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('should work for operation level parameters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            parameters: [
              {
                name: 'limit',
                in: 'query',
                description: 'This is how it works.',
                type: 'integer',
              },
            ],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if top level path parameter description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [
            {
              name: 'limit',
              in: 'query',
              type: 'integer',
            },
          ],
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: `oas${oasVersion}-parameter-description`,
        message: 'Parameter objects should have a `description`.',
        path: ['paths', '/todos', 'parameters', '0'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });

  test('return errors if operation level parameter description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            parameters: [
              {
                name: 'limit',
                in: 'query',
                type: 'integer',
              },
            ],
          },
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: `oas${oasVersion}-parameter-description`,
        message: 'Parameter objects should have a `description`.',
        path: ['paths', '/todos', 'get', 'parameters', '0'],
        severity: 1,
      }),
    ]);
  });

  test('does not throw on refs', () => {
    return expect(
      s.run({
        swagger: '2.0',
        paths: {
          '/todos': {
            parameters: [
              {
                $ref: '#/parameters/limit',
              },
            ],
          },
        },
      }),
    ).resolves.toBeInstanceOf(Array);
  });
};
