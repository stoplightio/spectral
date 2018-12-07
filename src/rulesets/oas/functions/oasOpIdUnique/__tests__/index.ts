import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpIdUnique', () => {
  const s = new Spectral();

  s.setFunctions(ruleset.functions || {});
  s.setRules({
    oas2: {
      'operation-operationId-unique': Object.assign(ruleset.rules.oas2['operation-operationId-unique'], {
        enabled: true,
      }),
    },
  });

  test('validate a correct object', () => {
    const results = s.run(
      {
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
      },
      {
        format: 'oas2',
      }
    );
    expect(results.results.length).toEqual(0);
  });

  test('return errors on different path operations same id', () => {
    const results = s.run(
      {
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
      },
      {
        format: 'oas2',
      }
    );

    expect(results.results.length).toEqual(2);
  });

  test('return errors on same path operations same id', () => {
    const results = s.run(
      {
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
      },
      {
        format: 'oas2',
      }
    );

    expect(results.results.length).toEqual(2);
  });
});
