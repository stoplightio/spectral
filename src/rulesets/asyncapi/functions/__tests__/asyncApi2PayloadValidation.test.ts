import { functions } from '../../../../functions';
import * as asyncApi2Schema from '../../schemas/schema.asyncapi2.json';
import { asyncApi2PayloadValidation } from '../asyncApi2PayloadValidation';

function runPayloadValidation(targetVal: any) {
  return asyncApi2PayloadValidation.call(
    { functions },
    targetVal,
    { asyncApi2Schema },
    { given: ['$', 'components', 'messages', 'aMessage'] },
    { given: null, original: null, documentInventory: {} as any },
  );
}

describe('asyncApi2PayloadValidation', () => {
  describe('AsyncApi2 schema', () => {
    const validSchemaFormats = [
      undefined,
      'application/vnd.aai.asyncapi;version=2.0.0',
      'application/vnd.aai.asyncapi+json;version=2.0.0',
      'application/vnd.aai.asyncapi+yaml;version=2.0.0',
    ];

    test.each(validSchemaFormats)(
      'Properly identify payload that do not fit the schema object definition',
      (schemaFormat: string | undefined) => {
        const message = {
          schemaFormat,
          payload: {
            type: 'object',
            deprecated: 14,
          },
        };

        const results = runPayloadValidation(message);

        expect(results).toEqual([
          {
            message: '{{property|gravis|append-property|optional-typeof|capitalize}}type should be boolean',
            path: ['$', 'components', 'messages', 'aMessage', 'payload', 'deprecated'],
          },
        ]);
      },
    );

    test.each(validSchemaFormats)('Returns no result when no payload', (schemaFormat: string | undefined) => {
      const message = { schemaFormat };

      const results = runPayloadValidation(message);

      expect(results).toEqual([]);
    });
  });

  test('Returns no result when schemaFormat bears an unsupported value', () => {
    const message = {
      schemaFormat: 'application/nope',
      payload: {
        type: 'object',
        deprecated: 14,
      },
    };

    const results = runPayloadValidation(message);

    expect(results).toEqual([]);
  });
});
