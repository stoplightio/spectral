import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOp2xxResponse', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-2xx-response': Object.assign(
              ruleset.rules.oas2['operation-2xx-response'],
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
              responses: {
                '200': {
                  description: '',
                  schema: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing 2xx', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              responses: {
                '400': {
                  description: '',
                  schema: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(results.length).toEqual(1);
  });

  test('return errors if no responses', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              responses: {},
            },
          },
        },
      },
    });
    expect(results.length).toEqual(1);
  });
});
