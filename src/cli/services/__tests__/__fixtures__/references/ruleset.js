const { default:schema } = require('../../../../../../dist/functions/schema');

module.exports = {
  rules: {
    'valid-schema': {
      given: '$',
      then: {
        function: schema,
        functionOptions: {
          allErrors: true,
          schema: {
            type: 'object',
            properties: {
              info: {
                type: 'object',
                properties: {
                  contact: {
                    type: 'object',
                  },
                  description: {
                    type: 'string',
                  },
                  version: {
                    type: 'number',
                  },
                },
                required: ['version'],
              },
              paths: {
                type: 'object',
                patternProperties: {
                  '^\\/': {
                    type: 'object',
                    properties: {
                      get: {
                        type: 'object',
                        properties: {
                          responses: {
                            type: 'object',
                          },
                          response: {
                            type: 'number',
                          },
                        },
                        required: ['responses'],
                        additionalProperties: false,
                      },
                    },
                  },
                },
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
  },
};
