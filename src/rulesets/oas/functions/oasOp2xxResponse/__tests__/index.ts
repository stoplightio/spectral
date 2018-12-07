import { Spectral } from '../../../../../spectral';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOp2xxResponse', () => {
  const s = new Spectral();
  s.setFunctions(ruleset.functions || {});
  s.setRules({
    oas2: {
      'operation-2xx-response': Object.assign(ruleset.rules.oas2['operation-2xx-response'], {
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
      {
        format: 'oas2',
      }
    );
    expect(results.results.length).toEqual(0);
  });

  test('return errors if missing 2xx', () => {
    const results = s.run(
      {
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
      {
        format: 'oas2',
      }
    );

    expect(results.results.length).toEqual(1);
  });

  test('return errors if no responses', () => {
    const results = s.run(
      {
        paths: {
          '/path1': {
            get: {
              responses: {},
            },
          },
        },
      },
      {
        format: 'oas2',
      }
    );
    expect(results.results.length).toEqual(1);
  });
});
