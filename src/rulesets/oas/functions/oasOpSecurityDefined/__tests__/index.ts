import { Spectral } from '../../../../../index';
import { commonOasFunctions, commonOasRules } from '../../../index';

const ruleset = { functions: commonOasFunctions(), rules: commonOasRules() };

// TODO: did usage of this custom function go away? where is it?
describe.skip('oasOpSecurityDefined', () => {
  describe('oas2', () => {
    const s = new Spectral();
    s.addFunctions(ruleset.functions || {});
    s.addRules({
      'operation-security-defined': Object.assign(ruleset.rules['operation-security-defined'], {
        enabled: true,
      }),
    });

    test('validate a correct object (just in body)', () => {
      const results = s.run({
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
      });
      expect(results.results.length).toEqual(0);
    });

    test('return errors on invalid object', () => {
      const results = s.run({
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
      });

      expect(results.results.length).toEqual(1);
    });
  });

  describe('oas3', () => {
    const s = new Spectral();
    s.addFunctions(ruleset.functions || {});
    s.addRules({
      'operation-security-defined': Object.assign(ruleset.rules['operation-security-defined'], {
        enabled: true,
      }),
    });

    test('validate a correct object (just in body)', () => {
      const results = s.run({
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
      });
      expect(results.results.length).toEqual(0);
    });

    test('return errors on invalid object', () => {
      const results = s.run({
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
      });

      expect(results.results.length).toEqual(1);
    });
  });
});
