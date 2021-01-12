import { cloneDeep } from 'lodash';

import type { Spectral } from '../../../spectral';
import { DiagnosticSeverity } from '@stoplight/types';
import { loadRules } from './__helpers__/loadRules';

const ruleName = 'asyncapi-headers-schema-type-object';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    const headersBearer = {
      headers: {
        type: 'object',
        properties: {
          'some-header': {
            type: 'string',
          },
        },
      },
    };

    doc = {
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
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.messages.{message}.headers is not of type "object"', async () => {
    doc.components.messages.aMessage.headers = { type: 'integer' };

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message:
          'Headers schema type should be `object` (`type` property should be equal to one of the allowed values: `object`. Did you mean `object`?).',
        path: ['components', 'messages', 'aMessage', 'headers', 'type'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if components.messages.{message}.headers lacks "type" property', async () => {
    doc.components.messages.aMessage.headers = { const: 'Hello World!' };

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Headers schema type should be `object` (`headers` property should have required property `type`).',
        path: ['components', 'messages', 'aMessage', 'headers'],
        severity: DiagnosticSeverity.Error,
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
          'Headers schema type should be `object` (`type` property should be equal to one of the allowed values: `object`. Did you mean `object`?).',
        path: ['components', 'messageTraits', 'aTrait', 'headers', 'type'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if components.messageTraits.{trait}.headers lacks "type" property', async () => {
    doc.components.messageTraits.aTrait.headers = { const: 'Hello World!' };

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Headers schema type should be `object` (`headers` property should have required property `type`).',
        path: ['components', 'messageTraits', 'aTrait', 'headers'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.headers lacks "type" property',
    async (property: string) => {
      doc.channels['users/{userId}/signedUp'][property].message.headers = { const: 'Hello World!' };

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message: 'Headers schema type should be `object` (`headers` property should have required property `type`).',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'headers'],
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    },
  );

  test.each(['publish', 'subscribe'])(
    'return result if channels.{channel}.%s.message.headers is not of type "object"',
    async (property: string) => {
      doc.channels['users/{userId}/signedUp'][property].message.headers = { type: 'integer' };

      const results = await s.run(doc, { ignoreUnknownFormat: false });

      expect(results).toEqual([
        expect.objectContaining({
          code: ruleName,
          message:
            'Headers schema type should be `object` (`type` property should be equal to one of the allowed values: `object`. Did you mean `object`?).',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'headers', 'type'],
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    },
  );
});
