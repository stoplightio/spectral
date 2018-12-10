import { Spectral } from '../../../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('operation-operationId', () => {
  const s = new Spectral();
  s.addRules({
    'operation-operationId': Object.assign(ruleset.rules['operation-operationId'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: 'some-id',
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if operation id is missing', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect(results.results.length).toEqual(1);
  });

  test('does not get called on parameters', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [],
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });
});
