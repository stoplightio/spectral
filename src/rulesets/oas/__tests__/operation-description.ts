import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('operation-description', () => {
  const s = new Spectral();
  s.addRules({
    'operation-description': Object.assign(ruleset.rules['operation-description'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            description: 'some-description',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if operation description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect(results).toMatchSnapshot();
  });

  test('does not get called on parameters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [],
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});
