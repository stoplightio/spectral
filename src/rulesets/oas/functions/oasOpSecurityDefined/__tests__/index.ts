import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpSecurityDefined', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-security-defined': Object.assign(
              ruleset.rules['oas2|oas3']['operation-security-defined'],
              {
                enabled: true,
              }
            ),
          },
        },
      },
    ],
  });

  test('validate a correct object (just in body)', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        securityDefinitions: {
          apikey: {},
        },
        paths: {
          '/path': {
            get: {
              security: [
                {
                  apikey: [],
                },
              ],
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors on invalid object', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        securityDefinitions: {},
        paths: {
          '/path': {
            get: {
              security: [
                {
                  apikey: [],
                },
              ],
            },
          },
        },
      },
    });

    expect(results.length).toEqual(1);
  });
});
