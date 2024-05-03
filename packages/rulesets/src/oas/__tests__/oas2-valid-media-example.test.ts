import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-valid-media-example', [
  {
    name: 'valid examples in responses',
    document: {
      swagger: '2.0',
      responses: {
        200: {
          schema: {
            type: 'string',
          },
          examples: {
            'application/json': 'test',
            'application/yaml': '',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid example in responses',
    document: {
      swagger: '2.0',
      responses: {
        200: {
          schema: {
            type: 'string',
          },
          examples: {
            'application/json': 'test',
            'application/yaml': 2,
          },
        },
      },
    },
    errors: [
      {
        message: '"application/yaml" property type must be string',
        path: ['responses', '200', 'examples', 'application/yaml'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Ignore required writeOnly parameters on responses',
    document: {
      swagger: '2.0',
      paths: {
        '/': {
          post: {
            responses: {
              '200': {
                schema: {
                  required: ['ro', 'wo'],
                  properties: {
                    ro: {
                      type: 'string',
                      readOnly: true,
                    },
                    wo: {
                      type: 'string',
                      writeOnly: true,
                    },
                    other: {
                      type: 'string',
                    },
                  },
                },
                examples: {
                  'application/json': {
                    other: 'foobar',
                    ro: 'some',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        foo: {
          schema: {
            required: ['ro', 'wo', 'other'],
            properties: {
              ro: {
                type: 'string',
                readOnly: true,
              },
              wo: {
                type: 'string',
                writeOnly: true,
              },
              other: {
                type: 'string',
              },
            },
          },
          examples: {
            'application/json': {
              other: 'foo',
              ro: 'some',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
