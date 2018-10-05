import { IRuleset, RuleFunction, RuleType } from '../../types';

export const operationPath = "$..paths.*[?( name() !== 'parameters' )]";

export const commonOasRuleset = (): IRuleset => {
  return {
    name: 'oas',
    functions: {
      oasPathParam: require('./functions/oasPathParam').oasPathParam,
      oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
      oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined,
      oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
      oasOpNoBodyFormData: require('./functions/oasOpNoBodyFormData').oasOpNoBodyFormData,
      oasOpInBodyOne: require('./functions/oasOpInBodyOne').oasOpInBodyOne,
      oasOpParametersUnique: require('./functions/oasOpParametersUnique').oasOpParametersUnique,
      oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck')
        .oasOpFormDataConsumeCheck,
    },
    rules: {
      'oas2|oas3': {
        'operation-2xx-response': {
          enabled: true,
          function: 'oasOp2xxResponse',
          path: "$..paths.*[?( name() !== 'parameters' )].responses",
          summary: 'Operation must have at least one `2xx` response.',
          type: RuleType.STYLE,
        },
        'operation-security-defined': {
          enabled: true,
          function: 'oasOpSecurityDefined',
          path: '$',
          summary:
            'Operation `security` requirements must have matching a definition under `securityDefintion`.',
          type: RuleType.VALIDATION,
        },
        'operation-operationId-unique': {
          enabled: true,
          function: 'oasOpIdUnique',
          path: '$',
          summary: 'Every operation must have a unique `operationId`.',
          type: RuleType.VALIDATION,
        },

        'operation-no-body-formData': {
          enabled: true,
          function: 'oasOpNoBodyFormData',
          path: "$..paths.*[?( name() !== 'parameters' )].parameters",
          summary: 'Operation cannot have both `in:body` and `in:formData` parameters.',
          type: RuleType.VALIDATION,
        },
        'operation-in-body-one': {
          enabled: true,
          function: 'oasOpInBodyOne',
          path: "$..paths.*[?( name() !== 'parameters' )].parameters",
          summary: 'Operation must have only one `in:body` parameter.',
          type: RuleType.VALIDATION,
        },
        'operation-parameters-unique': {
          enabled: true,
          function: 'oasOpParametersUnique',
          path: "$..paths.*[?( name() !== 'parameters' )].parameters",
          summary: 'Operations must have unique `name` + `in` parameters.',
          type: RuleType.VALIDATION,
        },
        'operation-formData-consume-check': {
          enabled: true,
          function: 'oasOpFormDataConsumeCheck',
          path: "$..paths.*[?( name() !== 'parameters' )]",
          summary:
            'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their consumes property.',
          type: RuleType.VALIDATION,
        },
        'path-params': {
          type: RuleType.VALIDATION,
          summary:
            'Params defined in the path must have a corresponding property in the params object.',
          enabled: false, // FIXME should be true when the function is actually implemented correctly
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
        'info-description': {
          summary: 'API `description` must be present and non-empty string.',
          enabled: true,
          function: RuleFunction.TRUTHY,

          input: {
            properties: 'description',
          },
          path: '$.info',
          type: RuleType.STYLE,
        },
        'info-license': {
          summary: 'API `license` must be present and non-empty string.',
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'license',
          },
          path: '$.info',
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
        'model-examples': {
          summary: 'Definition `description` must be present and non-empty string.',
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: '$..definitions.*',
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
        'only-local-references': {
          summary: 'References should start with `#/`.',
          enabled: true,
          function: RuleFunction.PATTERN,
          input: {
            value: '^#\\/',
          },
          path: "$..['$ref']",
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
        'operation-default-response': {
          summary: 'Operation must have a default response.',
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'default',
          },
          path: '$..paths.*.*.responses',
          type: RuleType.STYLE,
        },
        'operation-description': {
          summary: 'Operation `description` must be present and non-empty string.',
          enabled: true,
          function: RuleFunction.TRUTHY,
          input: {
            properties: 'description',
          },
          path: "$..paths.*[?( name() !== 'parameters' )]",
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
        'operation-singular-tag': {
          summary: 'Operation must have one and only one tag.',
          enabled: true,
          function: RuleFunction.SCHEMA,
          input: {
            schema: {
              items: {
                type: 'number',
              },
              maxItems: 1,
              minItems: 1,
              type: 'array',
            },
          },
          path: "$..paths.*[?( name() !== 'parameters' )].tags",
          type: RuleType.STYLE,
        },
        'operation-summary-formatted': {
          summary: 'Operation `summary` should start with upper case and end with a dot.',
          enabled: true,
          function: RuleFunction.PATTERN,
          input: {
            value: '^[A-Z].*\\.$',
          },
          path: "$..paths.*[?( name() !== 'parameters' )].summary",
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
        },
      },
    },
  };
};
