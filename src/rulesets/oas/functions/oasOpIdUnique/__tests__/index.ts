import { Spectral } from '../../../../../index';
import { commonOasFunctions, commonOasRules } from '../../../index';

const ruleset = { functions: commonOasFunctions(), rules: commonOasRules() };

describe('oasOpIdUnique', () => {
  const s = new Spectral();

  s.addFunctions(ruleset.functions || {});
  s.addRules({
    'operation-operationId-unique': Object.assign(ruleset.rules['operation-operationId-unique'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id2',
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors on different path operations same id', () => {
    const results = s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id1',
          },
        },
      },
    });

    expect(results.results.length).toEqual(2);
  });

  test('return errors on same path operations same id', () => {
    const results = s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
          post: {
            operationId: 'id1',
          },
        },
      },
    });

    expect(results.results.length).toEqual(2);
  });
});
