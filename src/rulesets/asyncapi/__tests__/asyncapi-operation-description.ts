import { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-operation-description';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        one: {
          publish: {
            description: 'I do this.',
          },
          subscribe: {
            description: '...and that',
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
    'return result if channels.{channel}.%s.description property is missing',
    async (property: string) => {
      delete doc.channels.one[property].description;

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Operation `description` must be present and non-empty string.',
          path: ['channels', 'one', property],
          severity: DiagnosticSeverity.Warning,
        }),
      ]);
    },
  );
});
