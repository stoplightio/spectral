export { schema as default };

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    aliases: {
      type: 'object',
      additionalProperties: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              description: {
                type: 'string',
              },
              targets: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  properties: {
                    formats: {
                      $ref: '#/properties/formats',
                    },
                    given: {
                      type: 'string',
                    },
                  },
                  required: ['formats', 'given'],
                },
              },
            },
            required: ['targets'],
          },
        ],
      },
    },
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
      minItems: 1,
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
          'json-schema-draft-2019-09',
          'json-schema-2019-09',
          'json-schema-draft-2020-12',
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
