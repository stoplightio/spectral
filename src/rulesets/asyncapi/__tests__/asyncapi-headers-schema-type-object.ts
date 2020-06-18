import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-headers-schema-type-object';
let s: Spectral;
let rule: Rule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const headersBearer: any = {
    headers: {
      type: 'object',
      properties: {
        'some-header': {
          type: 'string',
        },
      },
    },
  };

  const doc: any = {
    asyncapi: '2.0.0',
    channels: {
      'users/{userId}/signedUp': {
        publish: {
          message: cloneDeep(headersBearer),
        },
        subscribe: {
          message: cloneDeep(headersBearer),
        },
      },
    },
    components: {
      messageTraits: {
        aTrait: cloneDeep(headersBearer),
      },
      messages: {
        aMessage: cloneDeep(headersBearer),
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.messages.{message}.headers is not of type "object"', async () => {
    const clone = cloneDeep(doc);

    clone.components.messages.aMessage.headers = { type: 'integer' };

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message:
          'Headers schema type should be `object` (`type` property should be equal to one of the allowed values: object. Did you mean object?).',
        path: ['components', 'messages', 'aMessage', 'headers', 'type'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.messages.{message}.headers lacks "type" property', async () => {
    const clone = cloneDeep(doc);

    clone.components.messages.aMessage.headers = { const: 'Hello World!' };

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Headers schema type should be `object` (`headers` property should have required property `type`).',
        path: ['components', 'messages', 'aMessage', 'headers'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.headers is not of type "object"', async () => {
    const clone = cloneDeep(doc);

    clone.components.messageTraits.aTrait.headers = { type: 'integer' };

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message:
          'Headers schema type should be `object` (`type` property should be equal to one of the allowed values: object. Did you mean object?).',
        path: ['components', 'messageTraits', 'aTrait', 'headers', 'type'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.headers lacks "type" property', async () => {
    const clone = cloneDeep(doc);

    clone.components.messageTraits.aTrait.headers = { const: 'Hello World!' };

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Headers schema type should be `object` (`headers` property should have required property `type`).',
        path: ['components', 'messageTraits', 'aTrait', 'headers'],
        severity: rule.severity,
      }),
    ]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.headers lacks "type" property',
    async (property: string) => {
      const clone = cloneDeep(doc);

      clone.channels['users/{userId}/signedUp'][property].message.headers = { const: 'Hello World!' };

      const results = await s.run(clone, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Headers schema type should be `object` (`headers` property should have required property `type`).',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'headers'],
          severity: rule.severity,
        }),
      ]);
    },
  );

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.headers is not of type "object"',
    async (property: string) => {
      const clone = cloneDeep(doc);

      clone.channels['users/{userId}/signedUp'][property].message.headers = { type: 'integer' };

      const results = await s.run(clone, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message:
            'Headers schema type should be `object` (`type` property should be equal to one of the allowed values: object. Did you mean object?).',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'headers', 'type'],
          severity: rule.severity,
        }),
      ]);
    },
  );
});
