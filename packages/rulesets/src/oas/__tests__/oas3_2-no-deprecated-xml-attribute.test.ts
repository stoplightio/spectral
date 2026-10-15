import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3_2-no-deprecated-xml-attribute', [
  {
    name: 'valid: xml.nodeType used instead of xml.attribute',
    document: {
      openapi: '3.2.0',
      info: { title: 'Test', version: '0.1.0' },
      paths: {},
      components: {
        schemas: {
          MyModel: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                xml: { nodeType: 'attribute' },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid: xml without attribute field',
    document: {
      openapi: '3.2.0',
      info: { title: 'Test', version: '0.1.0' },
      paths: {},
      components: {
        schemas: {
          MyModel: {
            type: 'object',
            xml: { name: 'MyModel' },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid: xml.attribute: false (not the deprecated form)',
    document: {
      openapi: '3.2.0',
      info: { title: 'Test', version: '0.1.0' },
      paths: {},
      components: {
        schemas: {
          MyModel: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                xml: { attribute: false },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid: xml.attribute: true used in a schema property',
    document: {
      openapi: '3.2.0',
      info: { title: 'Test', version: '0.1.0' },
      paths: {},
      components: {
        schemas: {
          MyModel: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                xml: { attribute: true },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"xml.attribute" is deprecated in OAS 3.2; use "xml.nodeType: attribute" instead.',
        path: ['components', 'schemas', 'MyModel', 'properties', 'id', 'xml'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid: xml.attribute: true in a response schema',
    document: {
      openapi: '3.2.0',
      info: { title: 'Test', version: '0.1.0' },
      paths: {
        '/items': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/xml': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          xml: { attribute: true },
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
    },
    errors: [
      {
        message: '"xml.attribute" is deprecated in OAS 3.2; use "xml.nodeType: attribute" instead.',
        path: [
          'paths',
          '/items',
          'get',
          'responses',
          '200',
          'content',
          'application/xml',
          'schema',
          'properties',
          'name',
          'xml',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'not applicable: OAS 3.1 document with xml.attribute: true should not trigger this rule',
    document: {
      openapi: '3.1.0',
      info: { title: 'Test', version: '0.1.0' },
      paths: {},
      components: {
        schemas: {
          MyModel: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                xml: { attribute: true },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
