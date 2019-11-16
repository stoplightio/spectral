import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '../../../spectral';
import testParameterDescription from '../../__tests__/shared/_parameter-description';
import * as ruleset from '../index.json';

describe('oas3-parameter-description', () => {
  const s = new Spectral();
  s.registerFormat('oas3', () => true);
  s.setRules({
    'oas3-parameter-description': Object.assign(ruleset.rules['oas3-parameter-description'], {
      recommended: true,
    }),
  });

  testParameterDescription(s, 3);

  describe('$.components.parameters', () => {
    it('validates description', async () => {
      const results = await s.run({
        openapi: '3.0.2',
        components: {
          parameters: {
            address: {
              in: 'body',
            },
          },
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas3-parameter-description',
          message: 'Parameter objects should have a `description`.',
          path: ['components', 'parameters', 'address'],
          severity: DiagnosticSeverity.Warning,
        }),
      ]);
    });
  });

  describe('description for parameters in links', () => {
    describe('$.components.links', () => {
      it('does not validate description', async () => {
        const results = await s.run({
          openapi: '3.0.2',
          components: {
            links: {
              address: {
                operationId: 'getUserAddressByUUID',
                parameters: {
                  param: {
                    value: 'value',
                    in: 'header',
                  },
                },
              },
            },
          },
        });

        expect(results).toEqual([]);
      });
    });

    describe('links in a response', () => {
      it('does not validate description', async () => {
        const results = await s.run({
          paths: {
            '/pets': {
              get: {
                responses: {
                  '200': {
                    links: {
                      abc: {
                        parameters: {
                          param: {
                            in: 'body',
                            val: 2,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        expect(results).toEqual([]);
      });
    });
  });
});
