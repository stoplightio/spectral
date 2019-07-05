import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('parameter-description', () => {
  const s = new Spectral();

  s.addRules({
    'parameter-description': Object.assign(ruleset.rules['parameter-description'], {
      recommended: true,
      type: RuleType[ruleset.rules['parameter-description'].type],
    }),
  });

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

  test('return errors if shared level parameter description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      parameters: {
        limit: {
          name: 'limit',
          in: 'query',
          type: 'integer',
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'parameter-description',
        message: 'Parameter objects should have a `description`.',
        path: ['parameters', 'limit', 'description'],
        severity: 1,
      }),
    ]);
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
        code: 'parameter-description',
        message: 'Parameter objects should have a `description`.',
        path: ['paths', '/todos', 'parameters', '0', 'description'],
        severity: 1,
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
        code: 'parameter-description',
        message: 'Parameter objects should have a `description`.',
        path: ['paths', '/todos', 'get', 'parameters', '0', 'description'],
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
    ).not.rejects;
  });
});
