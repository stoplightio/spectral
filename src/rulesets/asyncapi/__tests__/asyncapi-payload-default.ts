import { cloneDeep } from 'lodash';

import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-payload-default';

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
      default: { value: 17 },
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

  test('return result if components.messages.{message}.payload.default is not valid against the schema it decorates', async () => {
    doc.components.messages.aMessage.payload.default = { seventeen: 17 };

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property must have required property `value`',
        path: ['components', 'messages', 'aMessage', 'payload', 'default'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.payload.default is not valid against the schema it decorates', async () => {
    doc.components.messageTraits.aTrait.payload.default = { seventeen: 17 };

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property must have required property `value`',
        path: ['components', 'messageTraits', 'aTrait', 'payload', 'default'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.payload.default is not valid against the schema it decorates',
    async (property: string) => {
      doc.channels['users/{userId}/signedUp'][property].message.payload.default = { seventeen: 17 };

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: '`default` property must have required property `value`',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'payload', 'default'],
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    },
  );
});
