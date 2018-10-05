import { IRuleset } from '../../types';

export const operationPath = "$..paths.*[?( name() !== 'parameters' )]";

export const commonOasRuleset = (): IRuleset => {
  return {
    name: 'oas',
    functions: {
      oasPathParam: require('./functions/oasPathParam').oasPathParam,
    },
    rules: {
      'oas2|oas3': {
        'path-params': {
          type: 'validation',
          summary:
            'Params defined in the path must have a corresponding property in the params object.',
          enabled: false, // FIXME should be true when the function is actually implemented correctly
          severity: 'error',
          path: operationPath,
          function: 'oasPathParam',
        },
        'contact-properties': {
          enabled: false,
          function: 'truthy',
          input: {
            properties: ['email', 'name', 'url'],
          },
          path: '$.info.contact',
          summary: 'Contact object should have `name`, `url` and `email`.',
          type: 'style',
        },
        'example-value-or-externalValue': {
          enabled: true,
          function: 'xor',
          input: {
            properties: ['externalValue', 'value'],
          },
          path: '$..example',
          summary: 'Example should have either a `value` or `externalValue` field.',
          type: 'style',
        },
        'info-contact': {
          enabled: true,
          function: 'truthy',
          input: {
            properties: 'contact',
          },
          path: '$.info',
          summary: 'Info object should contain `contact` object.',
          type: 'style',
        },
        'license-apimatic-bug': {
          enabled: true,
          function: 'notContain',
          input: {
            properties: ['url'],
            value: 'gruntjs',
          },
          path: '$.license',
          summary: 'License URL should not point at `gruntjs`.',
          type: 'style',
        },
        'license-url': {
          enabled: false,
          function: 'truthy',
          input: {
            properties: 'url',
          },
          path: '$.info.license',
          summary: 'License object should include `url`.',
          type: 'style',
        },
        'no-eval-in-descriptions': {
          enabled: true,
          function: 'notContain',
          input: {
            properties: ['description', 'title'],
            value: 'eval(',
          },
          path: '$..*',
          summary: 'Markdown descriptions should not contain `eval(`.',
          type: 'style',
        },
        'no-script-tags-in-markdown': {
          enabled: true,
          function: 'notContain',
          input: {
            properties: ['description'],
            value: '<script',
          },
          path: '$..*',
          summary: 'Markdown descriptions should not contain `<script>` tags.',
          type: 'style',
        },
        'openapi-tags': {
          enabled: false,
          function: 'truthy',
          input: {
            properties: 'tags',
          },
          path: '$',
          summary: 'OpenAPI object should have non-empty `tags` array.',
          type: 'style',
        },
        'openapi-tags-alphabetical': {
          enabled: true,
          function: 'alphabetical',
          input: {
            keyedBy: 'name',
            properties: 'tags',
          },
          path: '$',
          summary: 'OpenAPI object should have alphabetical `tags`.',
          type: 'style',
        },
        'operation-operationId': {
          enabled: true,
          function: 'truthy',
          input: {
            properties: 'operationId',
          },
          path: operationPath,
          summary: 'Operation should have an `operationId`.',
          type: 'style',
        },
        'operation-summary-or-description': {
          enabled: true,
          function: 'or',
          input: {
            properties: ['description', 'summary'],
          },
          path: operationPath,
          summary: 'Operation should have `summary` or `description`.',
          type: 'style',
        },
        'operation-tags': {
          enabled: true,
          function: 'truthy',
          input: {
            properties: 'tags',
          },
          path: operationPath,
          summary: 'Operation should have non-empty `tags` array.',
          type: 'style',
        },
        'parameter-description': {
          enabled: true,
          function: 'truthy',
          input: {
            properties: 'description',
          },
          path: '$..paths.*.*.parameters',
          summary: 'Parameter objects should have a `description`.',
          type: 'style',
        },
        'path-keys-no-trailing-slash': {
          enabled: true,
          function: 'notEndWith',
          input: {
            property: '*',
            value: '/',
          },
          path: '$..paths',
          summary: 'Path keys should not end with a slash.',
          type: 'style',
        },
        'pathItem-summary-or-description': {
          enabled: false,
          function: 'or',
          input: {
            properties: ['description', 'summary'],
          },
          path: 'pathItem',
          summary: 'pathItem should have `summary` or `description`.',
          type: 'style',
        },
        'reference-components-regex': {
          enabled: false,
          function: 'pattern',
          input: {
            omit: '#',
            split: '/',
            value: '^[a-zA-Z0-9\\.\\-_]+$',
          },
          path: "$..['$ref']",
          summary: 'References should all match regex `^[a-zA-Z0-9\\.\\-_]+`.',
          type: 'style',
        },
        'reference-no-other-properties': {
          enabled: true,
          function: 'truthy',
          input: {
            properties: '$ref',
            max: 1,
          },
          path: 'reference',
          summary: 'References objects should only have a `$ref` property.',
          type: 'style',
        },
        'server-not-example.com': {
          enabled: false,
          function: 'notContain',
          input: {
            properties: ['url'],
            value: 'example.com',
          },
          path: '$.servers',
          summary: 'Server URL should not point at `example.com`.',
          type: 'style',
        },
        'server-trailing-slash': {
          enabled: true,
          function: 'notEndWith',
          input: {
            property: 'url',
            value: '/',
          },
          path: '$.servers',
          summary: 'Server URL should not have a trailing slash.',
          type: 'style',
        },
        'tag-description': {
          enabled: false,
          function: 'truthy',
          input: {
            properties: 'description',
          },
          path: '$.tags',
          summary: 'Tag object should have a `description`.',
          type: 'style',
        },
      },
    },
  };
};
