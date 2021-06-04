import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { rules as oasRules } from '../../../oas/index.json';
import oasOpSecurityDefined from '../oasOpSecurityDefined';

describe('oasOpSecurityDefined', () => {
  describe('oas2', () => {
    let s: Spectral;

    beforeEach(() => {
      s = new Spectral();
      s.registerFormat('oas2', () => true);
      s.setFunctions({ oasOpSecurityDefined });
      s.setRules({
        'oas2-operation-security-defined': Object.assign(oasRules['oas2-operation-security-defined'], {
          recommended: true,
          type: RuleType[oasRules['oas2-operation-security-defined'].type],
        }),
      });
    });

    it('validate a correct object (just in body)', async () => {
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

    it('return errors on invalid object', async () => {
      const results = await s.run({
        swagger: '2.0',
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

      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-operation-security-defined',
          message: 'Operation `security` values must match a scheme defined in the `securityDefinitions` object.',
          path: ['paths', '/path', 'get', 'security', '0'],
          severity: DiagnosticSeverity.Warning,
        }),
      ]);
    });
  });

  describe('oas3', () => {
    const s = new Spectral();
    s.registerFormat('oas3', () => true);
    s.setFunctions({ oasOpSecurityDefined });
    s.setRules({
      'oas3-operation-security-defined': Object.assign(oasRules['oas3-operation-security-defined'], {
        recommended: true,
        type: RuleType[oasRules['oas3-operation-security-defined'].type],
      }),
    });

    it('validate a correct object (just in body)', async () => {
      const results = await s.run({
        openapi: '3.0.2',
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

    it('return errors on invalid object', async () => {
      const results = await s.run({
        openapi: '3.0.2',
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

      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas3-operation-security-defined',
          message:
            'Operation `security` values must match a scheme defined in the `components.securitySchemes` object.',
          path: ['paths', '/path', 'get', 'security', '0'],
          severity: DiagnosticSeverity.Warning,
        }),
      ]);
    });
  });
});
