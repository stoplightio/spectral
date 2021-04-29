import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';
import { cloneDeep } from 'lodash';

const ruleName = 'asyncapi-payload';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    const payload = {
      type: 'object',
      properties: {
        value: {
          type: 'integer',
        },
      },
      required: ['value'],
    };

    doc = {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {
          publish: {
            message: {
              payload: cloneDeep(payload),
            },
          },
          subscribe: {
            message: {
              payload: cloneDeep(payload),
            },
          },
        },
      },
      components: {
        messageTraits: {
          aTrait: {
            payload: cloneDeep(payload),
          },
        },
        messages: {
          aMessage: {
            payload: cloneDeep(payload),
          },
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.messages.{message}.payload is not valid against the AsyncApi2 schema object', async () => {
    doc.components.messages.aMessage.payload.deprecated = 17;

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`deprecated` property type must be boolean',
        path: ['components', 'messages', 'aMessage', 'payload', 'deprecated'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.payload is not valid against the AsyncApi2 schema object', async () => {
    doc.components.messageTraits.aTrait.payload.deprecated = 17;

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`deprecated` property type must be boolean',
        path: ['components', 'messageTraits', 'aTrait', 'payload', 'deprecated'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.payload is not valid against the AsyncApi2 schema object',
    async (property: string) => {
      doc.channels['users/{userId}/signedUp'][property].message.payload.deprecated = 17;

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: '`deprecated` property type must be boolean',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'payload', 'deprecated'],
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    },
  );
});
