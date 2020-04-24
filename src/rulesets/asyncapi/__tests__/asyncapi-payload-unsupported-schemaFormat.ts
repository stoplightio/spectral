import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';
import { supportedSchemaFormats } from '../functions/asyncApi2PayloadValidation';

const ruleName = 'asyncapi-payload-unsupported-schemaFormat';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
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

  test.each(supportedSchemaFormats)(
    'validates a correct object (schemaFormat: "%s")',
    async (schemaFormat: string | undefined) => {
      const clone = cloneDeep(doc);

      clone.components.messages.aMessage.schemaFormat = schemaFormat;

      const results = await s.run(clone, { ignoreUnknownFormat: false });

      expect(results).toEqual([]);
    },
  );

  test('return result if components.messages.{message}.schemaFormat is set to a non supported value', async () => {
    const clone = cloneDeep(doc);

    clone.components.messages.aMessage.schemaFormat = 'application/nope';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message:
          'Message schema validation is only supported with default unspecified `schemaFormat`, or well known AsyncAPI2 mime types.',
        path: ['components', 'messages', 'aMessage', 'schemaFormat'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.schemaFormat is set to a non supported value', async () => {
    const clone = cloneDeep(doc);

    clone.components.messageTraits.aTrait.schemaFormat = 'application/nope';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message:
          'Message schema validation is only supported with default unspecified `schemaFormat`, or well known AsyncAPI2 mime types.',
        path: ['components', 'messageTraits', 'aTrait', 'schemaFormat'],
        severity: rule.severity,
      }),
    ]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.schemaFormat is set to a non supported value',
    async (property: string) => {
      const clone = cloneDeep(doc);

      clone.channels['users/{userId}/signedUp'][property].message.schemaFormat = 'application/nope';

      const results = await s.run(clone, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message:
            'Message schema validation is only supported with default unspecified `schemaFormat`, or well known AsyncAPI2 mime types.',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'schemaFormat'],
          severity: rule.severity,
        }),
      ]);
    },
  );
});
