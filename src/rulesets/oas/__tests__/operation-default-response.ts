import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('operation-default-response', () => {
  const s = new Spectral();
  s.addRules({
    'operation-default-response': Object.assign(ruleset.rules['operation-default-response'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          '/get': {
            responses: {
              default: {},
            },
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if path-responses is missing default', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          '/get': {
            responses: {
              '2xx': {},
            },
          },
        },
      },
    });
    expect(results.results).toMatchSnapshot();
  });
});
