import { IRuleset, RuleFunction, RuleSeverity, RuleType } from '../../types';

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
          type: RuleType.VALIDATION,
          summary:
            'Params defined in the path must have a corresponding property in the params object.',
          enabled: false, // FIXME should be true when the function is actually implemented correctly
          severity: RuleSeverity.ERROR,
          path: operationPath,
          function: 'oasPathParam',
        },
        'contact-properties': {
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: ['email', 'name', 'url'],
          },
          path: '$.info.contact',
          summary: 'Contact object should have `name`, `url` and `email`.',
          type: RuleType.STYLE,
        },
        'example-value-or-externalValue': {
          enabled: true,
          function: RuleFunction.XOR,
          input: {
            properties: ['externalValue', 'value'],
          },
          path: '$..example',
          summary: 'Example should have either a `value` or `externalValue` field.',
          type: RuleType.STYLE,
        },
        'info-contact': {
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'contact',
          },
          path: '$.info',
          summary: 'Info object should contain `contact` object.',
          type: RuleType.STYLE,
        },
        'license-apimatic-bug': {
          enabled: true,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: ['url'],
            value: 'gruntjs',
          },
          path: '$.license',
          summary: 'License URL should not point at `gruntjs`.',
          type: RuleType.STYLE,
        },
        'license-url': {
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'url',
          },
          path: '$.info.license',
          summary: 'License object should include `url`.',
          type: RuleType.STYLE,
        },
        'no-eval-in-descriptions': {
          enabled: true,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: ['description', 'title'],
            value: 'eval(',
          },
          path: '$..*',
          summary: 'Markdown descriptions should not contain `eval(`.',
          type: RuleType.STYLE,
        },
        'no-script-tags-in-markdown': {
          enabled: true,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: ['description'],
            value: '<script',
          },
          path: '$..*',
          summary: 'Markdown descriptions should not contain `<script>` tags.',
          type: RuleType.STYLE,
        },
        'openapi-tags': {
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'tags',
          },
          path: '$',
          summary: 'OpenAPI object should have non-empty `tags` array.',
          type: RuleType.STYLE,
        },
        'openapi-tags-alphabetical': {
          enabled: true,
          function: RuleFunction.ALPHABETICAL,
          input: {
            keyedBy: 'name',
            properties: 'tags',
          },
          path: '$',
          summary: 'OpenAPI object should have alphabetical `tags`.',
          type: RuleType.STYLE,
        },
        'operation-operationId': {
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'operationId',
          },
          path: operationPath,
          summary: 'Operation should have an `operationId`.',
          type: RuleType.STYLE,
        },
        'operation-summary-or-description': {
          enabled: true,
          function: RuleFunction.OR,
          input: {
            properties: ['description', 'summary'],
          },
          path: operationPath,
          summary: 'Operation should have `summary` or `description`.',
          type: RuleType.STYLE,
        },
        'operation-tags': {
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'tags',
          },
          path: operationPath,
          summary: 'Operation should have non-empty `tags` array.',
          type: RuleType.STYLE,
        },
        'parameter-description': {
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: '$..paths.*.*.parameters',
          summary: 'Parameter objects should have a `description`.',
          type: RuleType.STYLE,
        },
        'path-keys-no-trailing-slash': {
          enabled: true,
          function: RuleFunction.NOT_END_WITH,
          input: {
            property: '*',
            value: '/',
          },
          path: '$..paths',
          summary: 'Path keys should not end with a slash.',
          type: RuleType.STYLE,
        },
        'pathItem-summary-or-description': {
          enabled: false,
          function: RuleFunction.OR,
          input: {
            properties: ['description', 'summary'],
          },
          path: 'pathItem',
          summary: 'pathItem should have `summary` or `description`.',
          type: RuleType.STYLE,
        },
        'reference-components-regex': {
          enabled: false,
          function: RuleFunction.PATTERN,
          input: {
            omit: '#',
            split: '/',
            value: '^[a-zA-Z0-9\\.\\-_]+$',
          },
          path: "$..['$ref']",
          summary: 'References should all match regex `^[a-zA-Z0-9\\.\\-_]+`.',
          type: RuleType.STYLE,
        },
        'reference-no-other-properties': {
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: '$ref',
            max: 1,
          },
          path: 'reference',
          summary: 'References objects should only have a `$ref` property.',
          type: RuleType.STYLE,
        },
        'server-not-example.com': {
          enabled: false,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: ['url'],
            value: 'example.com',
          },
          path: '$.servers',
          summary: 'Server URL should not point at `example.com`.',
          type: RuleType.STYLE,
        },
        'server-trailing-slash': {
          enabled: true,
          function: RuleFunction.NOT_END_WITH,
          input: {
            property: 'url',
            value: '/',
          },
          path: '$.servers',
          summary: 'Server URL should not have a trailing slash.',
          type: RuleType.STYLE,
        },
        'tag-description': {
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: '$.tags',
          summary: 'Tag object should have a `description`.',
          type: RuleType.STYLE,
        },
      },
    },
  };
};
