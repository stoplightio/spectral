import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-examples-value-or-externalValue', [
  {
    name: 'just externalValue',
    document: {
      openapi: '3.0.0',
      components: { examples: { first: { externalValue: 'value' } } },
    },
    errors: [],
  },

  {
    name: 'just value',
    document: {
      openapi: '3.0.0',
      components: { examples: { first: { value: 'value' } } },
    },
    errors: [],
  },

  {
    name: 'example on top level',
    document: {
      openapi: '3.0.0',
      examples: { first: { value: 'value', externalValue: 'value' } },
    },
    errors: [],
  },

  {
    name: 'examples properties in examples',
    document: {
      openapi: '3.0.0',
      components: {
        examples: {
          first: {
            value: {
              examples: {
                a: 'b',
              },
            },
          },
          second: {
            value: {
              components: {
                examples: {
                  value: 'value',
                  externalValue: 'value',
                },
              },
            },
          },
          third: {
            value: {
              examples: {
                a: 'b',
              },
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'properties in schemas that are literally named example or examples',
    document: {
      openapi: '3.0.0',
      components: {
        schemas: {
          pet: {
            properties: {
              examples: {
                type: 'array',
              },
              example: {
                type: 'integer',
              },
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'multiple examples - validate all value or externalValue',
    document: {
      openapi: '3.0.0',
      components: {
        examples: {
          first: { value: 'value1' },
          second: { externalValue: 'external-value2' },
          third: { value: 'value3' },
        },
      },
    },
    errors: [],
  },

  {
    name: 'externalValue and value',
    document: {
      openapi: '3.0.0',
      components: { examples: { first: {} } },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'first'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'multiple examples - missing externalValue and value in one',
    document: {
      openapi: '3.0.0',
      components: {
        examples: {
          first: { value: 'value1' },
          second: { externalValue: 'external-value2' },
          third: {},
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'third'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'multiple examples - both externalValue and value',
    document: {
      openapi: '3.0.0',
      components: {
        examples: { first: { externalValue: 'externalValue', value: 'value' } },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'first'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'multiple examples - both externalValue and value in one (in components)',
    document: {
      openapi: '3.0.0',
      components: {
        examples: {
          first: { value: 'value1' },
          second: { externalValue: 'external-value2', value: 'value2' },
          third: { externalValue: 'external-value3' },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'second'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'headers containing multiple examples - both externalValue and value in one',
    document: {
      openapi: '3.0.0',
      components: {
        headers: {
          headerName: {
            examples: {
              first: { value: 'value1' },
              second: { externalValue: 'external-value2', value: 'value2' },
              third: { externalValue: 'external-value3' },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'headers', 'headerName', 'examples', 'second'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'multiple examples - both externalValue and value in one (in parameters)',
    document: {
      openapi: '3.0.0',
      components: {
        parameters: {
          parameterName: {
            examples: {
              first: { value: 'value1' },
              second: { externalValue: 'external-value2', value: 'value2' },
              third: { externalValue: 'external-value3' },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'parameters', 'parameterName', 'examples', 'second'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'multiple examples - both externalValue and value in one (in content)',
    document: {
      openapi: '3.0.0',
      paths: {
        '/path': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    examples: {
                      first: { value: 'value1' },
                      second: {
                        externalValue: 'external-value2',
                        value: 'value2',
                      },
                      third: { externalValue: 'external-value3' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['paths', '/path', 'get', 'responses', '200', 'content', 'application/json', 'examples', 'second'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'OpenAPI 3.2 - dataValue, serializedValue, value or externalValue',
    document: {
      openapi: '3.2.0',
      components: {
        examples: {
          first: { dataValue: { name: 'Rex' } },
          second: { serializedValue: '{"name":"Rex"}' },
          third: { value: { name: 'Rex' } },
          fourth: { externalValue: 'https://example.com/rex.json' },
          fifth: { dataValue: { name: 'Rex' }, serializedValue: '{"name":"Rex"}' },
          sixth: { dataValue: { name: 'Rex' }, externalValue: 'https://example.com/rex.json' },
        },
      },
    },
    errors: [],
  },

  {
    name: 'OpenAPI 3.2 - dataValue in content examples',
    document: {
      openapi: '3.2.0',
      paths: {
        '/pets': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    examples: {
                      rex: {
                        summary: 'a valid 3.2 example using dataValue',
                        dataValue: { name: 'Rex' },
                      },
                    },
                  },
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
    name: 'OpenAPI 3.2 - none of dataValue, serializedValue, value or externalValue',
    document: {
      openapi: '3.2.0',
      components: {
        examples: {
          first: { dataValue: { name: 'Rex' } },
          second: { summary: 'no value at all' },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value", "dataValue", "serializedValue" or "externalValue" field.',
        path: ['components', 'examples', 'second'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'OpenAPI 3.1 - dataValue and serializedValue do not count',
    document: {
      openapi: '3.1.0',
      components: {
        examples: {
          first: { dataValue: { name: 'Rex' } },
          second: { serializedValue: '{"name":"Rex"}' },
          third: { value: { name: 'Rex' } },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'first'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'second'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'OpenAPI 3.1 - both externalValue and value',
    document: {
      openapi: '3.1.0',
      components: {
        examples: {
          first: { value: 'value1', externalValue: 'external-value1' },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'first'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'OpenAPI 3.0 - dataValue does not count',
    document: {
      openapi: '3.0.3',
      components: {
        examples: {
          first: { dataValue: { name: 'Rex' } },
        },
      },
    },
    errors: [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
        path: ['components', 'examples', 'first'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
