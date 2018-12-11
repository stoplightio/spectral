import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('parameter-description', () => {
  const s = new Spectral();

  s.addRules({
    'parameter-description': Object.assign(ruleset.rules['parameter-description'], {
      enabled: true,
    }),
  });

  test('should work for shared level parameters', () => {
    const results = s.run({
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
    expect(results.results.length).toEqual(0);
  });

  test('should work for top level path parameters', () => {
    const results = s.run({
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
    expect(results.results.length).toEqual(0);
  });

  test('should work for operation level parameters', () => {
    const results = s.run({
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
    expect(results.results.length).toEqual(0);
  });

  test('return errors if shared level parameter description is missing', () => {
    const results = s.run({
      swagger: '2.0',
      parameters: {
        limit: {
          name: 'limit',
          in: 'query',
          type: 'integer',
        },
      },
    });
    expect(results.results.length).toEqual(1);
  });

  test('return errors if top level path parameter description is missing', () => {
    const results = s.run({
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
    expect(results.results.length).toEqual(1);
  });

  test('return errors if operation level parameter description is missing', () => {
    const results = s.run({
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
    expect(results.results.length).toEqual(1);
  });

  test.only('does not throw on refs', () => {
    const results = s.run({
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
    });
    expect(results.results.length).toEqual(0);
  });
});
