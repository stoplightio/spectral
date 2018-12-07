import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpSecurityDefined', () => {
  describe('oas2', () => {
    const s = new Spectral();
    s.setFunctions(ruleset.functions || {});
    s.setRules({
      oas2: {
        'operation-security-defined': Object.assign(ruleset.rules.oas2['operation-security-defined'], {
          enabled: true,
        }),
      },
    });

    test('validate a correct object (just in body)', () => {
      const results = s.run(
        {
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
        {
          format: 'oas2',
        }
      );
      expect(results.results.length).toEqual(0);
    });

    test('return errors on invalid object', () => {
      const results = s.run(
        {
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
        {
          format: 'oas2',
        }
      );

      expect(results.results.length).toEqual(1);
    });
  });

  describe('oas3', () => {
    const s = new Spectral();
    s.setFunctions(ruleset.functions || {});
    s.setRules({
      oas3: {
        'operation-security-defined': Object.assign(ruleset.rules.oas3['operation-security-defined'], {
          enabled: true,
        }),
      },
    });

    test('validate a correct object (just in body)', () => {
      const results = s.run(
        {
          components: {
            securitySchemes: {
              apikey: {},
            },
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
        {
          format: 'oas3',
        }
      );
      expect(results.results.length).toEqual(0);
    });

    test('return errors on invalid object', () => {
      const results = s.run(
        {
          components: {},
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
        {
          format: 'oas3',
        }
      );

      expect(results.results.length).toEqual(1);
    });
  });
});
