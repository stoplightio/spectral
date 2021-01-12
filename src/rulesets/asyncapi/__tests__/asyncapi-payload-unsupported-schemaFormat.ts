import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-payload-unsupported-schemaFormat';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {
          publish: {
            message: {},
          },
          subscribe: {
            message: {},
          },
        },
      },
      components: {
        messageTraits: {
          aTrait: {},
        },
        messages: {
          aMessage: {},
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.messages.{message}.schemaFormat is set to a non supported value', async () => {
    doc.components.messages.aMessage.schemaFormat = 'application/nope';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Message schema validation is only supported with default unspecified `schemaFormat`.',
        path: ['components', 'messages', 'aMessage', 'schemaFormat'],
        severity: DiagnosticSeverity.Information,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.schemaFormat is set to a non supported value', async () => {
    doc.components.messageTraits.aTrait.schemaFormat = 'application/nope';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Message schema validation is only supported with default unspecified `schemaFormat`.',
        path: ['components', 'messageTraits', 'aTrait', 'schemaFormat'],
        severity: DiagnosticSeverity.Information,
      }),
    ]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.schemaFormat is set to a non supported value',
    async (property: string) => {
      doc.channels['users/{userId}/signedUp'][property].message.schemaFormat = 'application/nope';

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Message schema validation is only supported with default unspecified `schemaFormat`.',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'schemaFormat'],
          severity: DiagnosticSeverity.Information,
        }),
      ]);
    },
  );
});
