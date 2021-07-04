import type { JSONSchema4 } from 'json-schema';

export { schema as default };

const schema: JSONSchema4 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    except: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    extends: {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                minItems: 2,
                items: [
                  {
                    type: 'string',
                  },
                  {
                    enum: ['all', 'recommended', 'off'],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    formats: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'oas2',
          'oas3',
          'oas3.0',
          'oas3.1',
          'asyncapi2',
          'json-schema',
          'json-schema-loose',
          'json-schema-draft4',
          'json-schema-draft6',
          'json-schema-draft7',
          'json-schema-2019-09',
          'json-schema-2020-12',
        ],
      },
    },
    functions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    functionsDir: {
      type: 'string',
    },
    rules: {
      type: 'object',
      properties: {
        formats: {
          $ref: '#/properties/formats',
        },
      },
    },
  },
};
