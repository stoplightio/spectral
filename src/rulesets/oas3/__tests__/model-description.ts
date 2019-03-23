import { Spectral } from '../../../spectral';
import { oas3Rules } from '../index';

const ruleset = { rules: oas3Rules() };

describe('model-description', () => {
  const s = new Spectral();
  s.addRules({
    'model-description': Object.assign(ruleset.rules['model-description'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      components: {
        schemas: {
          user: {
            description: 'this describes the user model',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if a definition is missing description', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      components: {
        schemas: {
          user: {},
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});
