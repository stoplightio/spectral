import { Spectral } from '../../../../../index';
import { oas2Functions, oas2Rules } from '../../../../oas2/index';
import { oas3Functions, oas3Rules } from '../../../../oas3/index';

const oas2Ruleset = { functions: oas2Functions(), rules: oas2Rules() };
const oas3Ruleset = { functions: oas3Functions(), rules: oas3Rules() };

describe('oasOpSecurityDefined', () => {
  describe('oas2', () => {
    const s = new Spectral();
    s.addFunctions(oas2Ruleset.functions || {});
    s.addRules({
      'operation-security-defined': Object.assign(oas2Ruleset.rules['operation-security-defined'], {
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

      expect(results.results).toMatchSnapshot();
    });
  });

  describe('oas3', () => {
    const s = new Spectral();
    s.addFunctions(oas3Ruleset.functions || {});
    s.addRules({
      'operation-security-defined': Object.assign(oas3Ruleset.rules['operation-security-defined'], {
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

      expect(results.results).toMatchSnapshot();
    });
  });
});
