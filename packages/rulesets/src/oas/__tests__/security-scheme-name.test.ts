import testRule from './__helpers__/tester';

testRule('security-scheme-name', [
  {
    name: 'valid case - simple alphanumeric name',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {
            type: 'apiKey',
            name: 'apiKey123',
            in: 'header',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case - name with allowed special characters',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          oauth2: {
            type: 'oauth2',
            name: 'api_key-token.v1',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/token',
                scopes: {
                  'write:pets': 'modify pets in your account',
                  'read:pets': 'read your pets',
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case - OAS 2.0 security scheme',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        petstore_auth: {
          type: 'oauth2',
          name: 'Authorization_Token',
          authorizationUrl: 'https://petstore.swagger.io/oauth/authorize',
          flow: 'implicit',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid case - name with spaces',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {
            type: 'apiKey',
            name: 'api key with spaces',
            in: 'header',
          },
        },
      },
    },
    errors: [
      {
        message: '"api key with spaces" must match the pattern "^[a-zA-Z0-9._-]+$"',
      },
    ],
  },

  {
    name: 'invalid case - name with special characters',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          oauth2: {
            type: 'oauth2',
            name: 'api@key#token',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/token',
                scopes: {},
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"api@key#token" must match the pattern "^[a-zA-Z0-9._-]+$"',
      },
    ],
  },

  {
    name: 'invalid case - name with parentheses and brackets',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          basic: {
            type: 'http',
            name: 'auth(token)[v1]',
            scheme: 'basic',
          },
        },
      },
    },
    errors: [
      {
        message: '"auth(token)[v1]" must match the pattern "^[a-zA-Z0-9._-]+$"',
      },
    ],
  },

  {
    name: 'mixed case - valid and invalid names',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          validApiKey: {
            type: 'apiKey',
            name: 'valid_api-key.v1',
            in: 'header',
          },
          invalidApiKey: {
            type: 'apiKey',
            name: 'invalid api+key!',
            in: 'header',
          },
          anotherValid: {
            type: 'http',
            name: 'Bearer123',
            scheme: 'bearer',
          },
        },
      },
    },
    errors: [
      {
        message: '"invalid api+key!" must match the pattern "^[a-zA-Z0-9._-]+$"',
      },
    ],
  },

  {
    name: 'edge case - empty name',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {
            type: 'apiKey',
            name: '',
            in: 'header',
          },
        },
      },
    },
    errors: [
      {
        message: '"" must match the pattern "^[a-zA-Z0-9._-]+$"',
      },
    ],
  },

  {
    name: 'valid case - numeric only name',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {
            type: 'apiKey',
            name: '12345',
            in: 'header',
          },
        },
      },
    },
    errors: [],
  },
]);
