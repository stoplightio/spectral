import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('operation-summary-formatted', () => {
  const s = new Spectral();
  s.addRules({
    'operation-summary-formatted': Object.assign(ruleset.rules['operation-summary-formatted'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'This is a valid summary.',
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if summary does not start with an uppercase', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'this is not a valid summary.',
          },
        },
      },
    });
    expect(results.results.length).toEqual(1);
  });

  test('return errors if summary does not end with a dot', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'This is not a valid summary',
          },
        },
      },
    });
    expect(results.results.length).toEqual(1);
  });
});
