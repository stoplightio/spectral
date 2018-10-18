import { IRuleset, RuleFunction, RuleSeverity, RuleType } from '../../types';

export const operationPath = "$..paths.*[?( name() !== 'parameters' )]";

export const commonOasRuleset = (): IRuleset => {
  return {
    name: 'oas',
    functions: {
      oasPathParam: require('./functions/oasPathParam').oasPathParam,
      oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
      oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined,
      oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
      oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck')
        .oasOpFormDataConsumeCheck,
      oasOpParams: require('./functions/oasOpParams').oasOpParams,
    },
    rules: {
      'oas2|oas3': {
        'operation-parameters': {
          enabled: true,
          function: 'oasOpParams',
          path: '$',
          summary: 'Operation parameters are unique and non-repeating.',
          type: RuleType.VALIDATION,
          tags: ['operation'],
        },
        'operation-2xx-response': {
          enabled: true,
          function: 'oasOp2xxResponse',
          path: `${operationPath}.responses`,
          summary: 'Operation must have at least one `2xx` response.',
          type: RuleType.STYLE,
          tags: ['operation'],
        },
        'operation-security-defined': {
          enabled: true,
          function: 'oasOpSecurityDefined',
          path: '$',
          summary:
            'Operation `security` values must match a scheme defined in global `securityDefinitions`.',
          type: RuleType.VALIDATION,
          tags: ['operation'],
        },
        'operation-operationId-unique': {
          enabled: true,
          function: 'oasOpIdUnique',
          path: '$',
          summary: 'Every operation must have a unique `operationId`.',
          type: RuleType.VALIDATION,
          tags: ['operation'],
        },

        'operation-formData-consume-check': {
          enabled: true,
          function: 'oasOpFormDataConsumeCheck',
          path: operationPath,
          summary:
            'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
          type: RuleType.VALIDATION,
          tags: ['operation'],
        },
        'path-params': {
          type: RuleType.VALIDATION,
          summary: 'Path parameters are correct and valid.',
          enabled: true,
          severity: RuleSeverity.ERROR,
          path: '$',
          function: 'oasPathParam',
          tags: ['path'],
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
          tags: ['api'],
        },
        'api-host': {
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: ['host'],
          },
          path: '$',
          summary: 'OpenAPI host `description` must be present and non-empty string.',
          type: RuleType.STYLE,
          tags: ['api'],
        },
        'api-schemes': {
          enabled: true,
          function: RuleFunction.SCHEMA,
          input: {
            schema: {
              items: {
                type: 'string',
              },
              minItems: 1,
              type: 'array',
            },
          },
          path: '$.schemes',
          summary: 'OpenAPI host `schemes` must be present and non-empty array.',
          type: RuleType.STYLE,
          tags: ['api'],
        },
        'example-value-or-externalValue': {
          enabled: false,
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
          tags: ['api'],
        },
        'info-description': {
          summary: 'OpenAPI object info `description` must be present and non-empty string.',
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: '$.info',
          type: RuleType.STYLE,
          tags: ['api'],
        },
        'info-license': {
          summary: 'OpenAPI object info `license` must be present and non-empty string.',
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'license',
          },
          path: '$.info',
          type: RuleType.STYLE,
          tags: ['api'],
        },
        'license-apimatic-bug': {
          enabled: false,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: ['url'],
            value: 'gruntjs',
          },
          path: '$.license',
          summary: 'License URL should not point at `gruntjs`.',
          type: RuleType.STYLE,
          tags: ['api'],
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
          tags: ['api'],
        },
        'model-description': {
          summary: 'Definition `description` must be present and non-empty string.',
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: '$..definitions.*',
          type: RuleType.STYLE,
        },
        'no-eval-in-descriptions': {
          enabled: false,
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
        'only-local-references': {
          summary: 'References should start with `#/`.',
          enabled: false,
          function: RuleFunction.PATTERN,
          input: {
            value: '^#\\/',
          },
          path: "$..['$ref']",
          type: RuleType.STYLE,
          tags: ['references'],
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
          tags: ['api'],
        },
        'openapi-tags-alphabetical': {
          enabled: false,
          function: RuleFunction.ALPHABETICAL,
          input: {
            keyedBy: 'name',
            properties: 'tags',
          },
          path: '$',
          summary: 'OpenAPI object should have alphabetical `tags`.',
          type: RuleType.STYLE,
          tags: ['api'],
        },
        'operation-default-response': {
          summary: 'Operations must have a default response.',
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'default',
          },
          path: '$..paths.*.*.responses',
          type: RuleType.STYLE,
          tags: ['operation'],
        },
        'operation-description': {
          summary: 'Operation `description` must be present and non-empty string.',
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: operationPath,
          type: RuleType.STYLE,
          tags: ['operation'],
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
          tags: ['operation'],
        },
        'operation-singular-tag': {
          summary: 'Operation must have one and only one tag.',
          enabled: false,
          function: RuleFunction.SCHEMA,
          input: {
            schema: {
              items: {
                type: 'string',
              },
              maxItems: 1,
              minItems: 1,
              type: 'array',
            },
          },
          path: `${operationPath}.tags`,
          type: RuleType.STYLE,
          tags: ['operation'],
        },
        'operation-summary-formatted': {
          summary: 'Operation `summary` should start with upper case and end with a dot.',
          enabled: false,
          function: RuleFunction.PATTERN,
          input: {
            value: '^[A-Z].*\\.$',
          },
          path: `${operationPath}.summary`,
          type: RuleType.STYLE,
          tags: ['operation'],
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
          tags: ['operation'],
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
          tags: ['operation'],
        },
        'parameter-description': {
          enabled: false,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: '$..paths.*.*.parameters',
          summary: 'Parameter objects should have a `description`.',
          type: RuleType.STYLE,
          tags: ['parameters'],
        },
        'path-declarations-must-exist': {
          summary: 'Path declarations cannot be empty, ex.`/path/{}` is invalid.',
          enabled: true,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: '*',
            value: '{}',
          },
          path: '$..paths',
          type: RuleType.STYLE,
          tags: ['path'],
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
          tags: ['path'],
        },
        'path-not-include-query': {
          summary: 'Path keys should not include a query string.',
          enabled: true,
          function: RuleFunction.NOT_CONTAIN,
          input: {
            properties: '*',
            value: '\\?',
          },
          path: '$..paths',
          type: RuleType.STYLE,
          tags: ['path'],
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
          tags: ['references'],
        },
        'schema-items-is-object': {
          summary: 'Schema containing `items` requires the items property to be an object.',
          enabled: true,
          function: RuleFunction.SCHEMA,
          input: {
            schema: {
              function: 'object',
            },
          },
          path: '$..schema.items',
          type: RuleType.VALIDATION,
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
          tags: ['api'],
        },
      },
    },
  };
};
