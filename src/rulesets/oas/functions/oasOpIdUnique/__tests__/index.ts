import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpIdUnique', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-operationId-unique': Object.assign(
              ruleset.rules['oas2|oas3']['operation-operationId-unique'],
              {
                enabled: true,
              }
            ),
          },
        },
      },
    ],
  });

  test('validate a correct object', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
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
    });
    expect(results.length).toEqual(0);
  });

  test('return errors on different path operations same id', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
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
    });

    expect(results.length).toEqual(2);
  });

  test('return errors on same path operations same id', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
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
    });

    expect(results.length).toEqual(2);
  });
});
