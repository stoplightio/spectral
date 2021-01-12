import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-operation-operationId';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        one: {
          publish: {
            operationId: 'onePubId',
          },
          subscribe: {
            operationId: 'oneSubId',
          },
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.operationId property is missing',
    async (property: string) => {
      delete doc.channels.one[property].operationId;

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Operation should have an `operationId`.',
          path: ['channels', 'one', property],
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    },
  );
});
