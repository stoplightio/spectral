import { RuleType, Spectral } from '../../../../../index';
import { oas2Functions } from '../../../../oas2/index';
import { rules as oas2Rules } from '../../../../oas2/index.json';
import { oas3Functions } from '../../../../oas3/index';
import { rules as oas3Rules } from '../../../../oas3/index.json';

const oas2Ruleset = { functions: oas2Functions(), rules: oas2Rules };
const oas3Ruleset = { functions: oas3Functions(), rules: oas3Rules };

describe('oasOpSecurityDefined', () => {
  describe('oas2', () => {
    const s = new Spectral();
    s.addFunctions(oas2Ruleset.functions || {});
    s.addRules({
      'operation-security-defined': Object.assign(oas2Ruleset.rules['operation-security-defined'], {
        recommended: true,
        type: RuleType[oas2Ruleset.rules['operation-security-defined'].type],
      }),
    });

    test('validate a correct object (just in body)', async () => {
      const results = await s.run({
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
      expect(results.length).toEqual(0);
    });

    test('return errors on invalid object', async () => {
      const results = await s.run({
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

      expect(results).toMatchSnapshot();
    });
  });

  describe('oas3', () => {
    const s = new Spectral();
    s.addFunctions(oas3Ruleset.functions || {});
    s.addRules({
      'operation-security-defined': Object.assign(oas3Ruleset.rules['operation-security-defined'], {
        recommended: true,
        type: RuleType[oas3Ruleset.rules['operation-security-defined'].type],
      }),
    });

    test('validate a correct object (just in body)', async () => {
      const results = await s.run({
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
      expect(results.length).toEqual(0);
    });

    test('return errors on invalid object', async () => {
      const results = await s.run({
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

      expect(results).toMatchSnapshot();
    });
  });
});
