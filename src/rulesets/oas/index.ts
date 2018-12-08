import { ValidationSeverity } from '@stoplight/types/validations';
import { FunctionCollection, RuleCollection, RuleFunction, RuleType } from '../../types';

export const operationPath = "$..paths.*[?( name() !== 'parameters' )]";

export const commonOasFunctions = (): FunctionCollection => {
  return {
    oasPathParam: require('./functions/oasPathParam').oasPathParam,
    oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
    oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined,
    oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
    oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck').oasOpFormDataConsumeCheck,
    oasOpParams: require('./functions/oasOpParams').oasOpParams,
  };
};

export const commonOasRules = (): RuleCollection => ({
  'operation-parameters': {
    then: {
      function: 'oasOpParams',
    },
    given: '$',
    summary: 'Operation parameters are unique and non-repeating.',
    type: RuleType.VALIDATION,
    tags: ['operation'],
  },
  'operation-2xx-response': {
    then: {
      function: 'oasOp2xxResponse',
    },
    given: `${operationPath}.responses`,
    summary: 'Operation must have at least one `2xx` response.',
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-operationId-unique': {
    then: {
      function: 'oasOpIdUnique',
    },
    given: '$',
    summary: 'Every operation must have a unique `operationId`.',
    type: RuleType.VALIDATION,
    tags: ['operation'],
  },

  'operation-formData-consume-check': {
    then: {
      function: 'oasOpFormDataConsumeCheck',
    },
    given: operationPath,
    summary:
      'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
    type: RuleType.VALIDATION,
    tags: ['operation'],
  },
  'path-params': {
    type: RuleType.VALIDATION,
    summary: 'given parameters are correct and valid.',
    severity: ValidationSeverity.Error,
    given: '$',
    then: {
      function: 'oasPathParam',
    },
    tags: ['given'],
  },
  'contact-properties': {
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: ['email', 'name', 'url'],
      },
    },
    given: '$.info.contact',
    summary: 'Contact object should have `name`, `url` and `email`.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'api-host': {
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: ['host'],
      },
    },
    given: '$',
    summary: 'OpenAPI `host` must be present and non-empty string.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'api-schemes': {
    then: {
      function: RuleFunction.SCHEMA,
      functionOptions: {
        schema: {
          items: {
            type: 'string',
          },
          minItems: 1,
          type: 'array',
        },
      },
    },
    given: '$.schemes',
    summary: 'OpenAPI host `schemes` must be present and non-empty array.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'example-value-or-externalValue': {
    enabled: false,
    then: {
      function: RuleFunction.XOR,
      functionOptions: {
        properties: ['externalValue', 'value'],
      },
    },
    given: '$..example',
    summary: 'Example should have either a `value` or `externalValue` field.',
    type: RuleType.STYLE,
  },
  'info-contact': {
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'contact',
      },
    },
    given: '$.info',
    summary: 'Info object should contain `contact` object.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'info-description': {
    summary: 'OpenAPI object info `description` must be present and non-empty string.',
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'description',
      },
    },
    given: '$.info',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'info-license': {
    summary: 'OpenAPI object info `license` must be present and non-empty string.',
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'license',
      },
    },
    given: '$.info',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'license-apimatic-bug': {
    enabled: false,
    then: {
      function: RuleFunction.NOT_CONTAIN,
      functionOptions: {
        properties: ['url'],
        value: 'gruntjs',
      },
    },
    given: '$.license',
    summary: 'License URL should not point at `gruntjs`.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'license-url': {
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'url',
      },
    },
    given: '$.info.license',
    summary: 'License object should include `url`.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'model-description': {
    summary: 'Definition `description` must be present and non-empty string.',
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'description',
      },
    },
    given: '$..definitions.*',
    type: RuleType.STYLE,
  },
  'no-eval-in-descriptions': {
    enabled: false,
    then: [
      {
        field: 'description',
        function: RuleFunction.PATTERN,
        functionOptions: {
          properties: ['description', 'title'],
          value: 'eval(',
        },
      },
    ],
    given: '$..*',
    summary: 'Markdown descriptions should not contain `eval(`.',
    type: RuleType.STYLE,
  },
  'no-script-tags-in-markdown': {
    then: {
      function: RuleFunction.NOT_CONTAIN,
      functionOptions: {
        properties: ['description'],
        value: '<script',
      },
    },
    given: '$..*',
    summary: 'Markdown descriptions should not contain `<script>` tags.',
    type: RuleType.STYLE,
  },
  'only-local-references': {
    summary: 'References should start with `#/`.',
    enabled: false,
    then: {
      function: RuleFunction.PATTERN,
      functionOptions: {
        value: '^#\\/',
      },
    },
    given: "$..['$ref']",
    type: RuleType.STYLE,
    tags: ['references'],
  },
  'openapi-tags': {
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'tags',
      },
    },
    given: '$',
    summary: 'OpenAPI object should have non-empty `tags` array.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'openapi-tags-alphabetical': {
    enabled: false,
    then: {
      function: RuleFunction.ALPHABETICAL,
      functionOptions: {
        keyedBy: 'name',
        properties: 'tags',
      },
    },
    given: '$',
    summary: 'OpenAPI object should have alphabetical `tags`.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
  'operation-default-response': {
    summary: 'Operations must have a default response.',
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'default',
      },
    },
    given: '$..paths.*.*.responses',
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-description': {
    summary: 'Operation `description` must be present and non-empty string.',
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'description',
      },
    },
    given: operationPath,
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-operationId': {
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'operationId',
      },
    },
    given: operationPath,
    summary: 'Operation should have an `operationId`.',
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-singular-tag': {
    summary: 'Operation must have one and only one tag.',
    enabled: false,
    then: {
      function: RuleFunction.SCHEMA,
      functionOptions: {
        schema: {
          items: {
            type: 'string',
          },
        },
        maxItems: 1,
        minItems: 1,
        type: 'array',
      },
    },
    given: `${operationPath}.tags`,
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-summary-formatted': {
    summary: 'Operation `summary` should start with upper case and end with a dot.',
    enabled: false,
    then: {
      function: RuleFunction.PATTERN,
      functionOptions: {
        value: '^[A-Z].*\\.$',
      },
    },
    given: `${operationPath}.summary`,
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-summary-or-description': {
    then: {
      function: RuleFunction.OR,
      functionOptions: {
        properties: ['description', 'summary'],
      },
    },
    given: operationPath,
    summary: 'Operation should have `summary` or `description`.',
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'operation-tags': {
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'tags',
      },
    },
    given: operationPath,
    summary: 'Operation should have non-empty `tags` array.',
    type: RuleType.STYLE,
    tags: ['operation'],
  },
  'parameter-description': {
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'description',
      },
    },
    given: '$..paths.*.*.parameters',
    summary: 'Parameter objects should have a `description`.',
    type: RuleType.STYLE,
    tags: ['parameters'],
  },
  'path-declarations-must-exist': {
    summary: 'given declarations cannot be empty, ex.`/given/{}` is invalid.',
    then: {
      field: '@key',
      function: RuleFunction.NOT_CONTAIN,
      functionOptions: {
        value: '{}',
      },
    },
    given: '$..paths[*]',
    type: RuleType.STYLE,
    tags: ['given'],
  },
  'path-keys-no-trailing-slash': {
    summary: 'given keys should not end with a slash.',
    given: '$..paths[*]',
    then: {
      field: '@key',
      function: RuleFunction.NOT_END_WITH,
      functionOptions: {
        value: '/',
      },
    },
    tags: ['given'],
  },
  'path-not-include-query': {
    summary: 'given keys should not include a query string.',
    then: {
      field: '@key',
      function: RuleFunction.NOT_CONTAIN,
      functionOptions: {
        value: '\\?',
      },
    },
    given: '$..paths[*]',
    type: RuleType.STYLE,
    tags: ['given'],
  },
  'schema-items-is-object': {
    summary: 'Schema containing `items` requires the items property to be an object.',
    then: {
      function: RuleFunction.SCHEMA,
      functionOptions: {
        schema: {
          function: 'object',
        },
      },
    },
    given: '$..schema.items',
    type: RuleType.VALIDATION,
  },
  'server-not-example.com': {
    enabled: false,
    then: {
      function: RuleFunction.NOT_CONTAIN,
      functionOptions: {
        properties: ['url'],
        value: 'example.com',
      },
    },
    given: '$.servers',
    summary: 'Server URL should not point at `example.com`.',
    type: RuleType.STYLE,
  },
  'server-trailing-slash': {
    then: {
      function: RuleFunction.NOT_END_WITH,
      functionOptions: {
        property: 'url',
        value: '/',
      },
    },
    given: '$.servers',
    summary: 'Server URL should not have a trailing slash.',
    type: RuleType.STYLE,
  },
  'tag-description': {
    enabled: false,
    then: {
      function: RuleFunction.TRUTHY,
      functionOptions: {
        properties: 'description',
      },
    },
    given: '$.tags',
    summary: 'Tag object should have a `description`.',
    type: RuleType.STYLE,
    tags: ['api'],
  },
});
