import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('oas2-valid-media-example', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['oas2-valid-media-example']);
  });

  describe('responses', () => {
    test('will pass when examples are valid', async () => {
      const results = await s.run({
        swagger: '2.0',
        responses: {
          200: {
            schema: {
              type: 'string',
            },
            examples: {
              'application/json': 'test',
              'application/yaml': '',
            },
          },
        },
      });
      expect(results).toHaveLength(0);
    });

    test('will fail when example is invalid', async () => {
      const results = await s.run({
        swagger: '2.0',
        responses: {
          200: {
            schema: {
              type: 'string',
            },
            examples: {
              'application/json': 'test',
              'application/yaml': 2,
            },
          },
        },
      });
      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-valid-media-example',
          message: '`application/yaml` property type should be string',
          severity: DiagnosticSeverity.Error,
          path: ['responses', '200', 'examples', 'application/yaml'],
        }),
      ]);
    });
  });
});
