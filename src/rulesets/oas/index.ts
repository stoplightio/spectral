import { DiagnosticSeverity } from '@stoplight/types';
import { FunctionCollection, RuleCollection, RuleFunction, RuleType } from '../../types';

export const operationPath =
  "$..paths.*[?( name() === 'get' || name() === 'put' || name() === 'post'" +
  " || name() === 'delete' || name() === 'options' || name() === 'head'" +
  " || name() === 'patch' || name() === 'trace' )]";

export const commonOasFunctions = (): FunctionCollection => {
  return {
    oasPathParam: require('./functions/oasPathParam').oasPathParam,
    oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
    oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined, // used in oas2/oas3 differently see their rulesets for details
    oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
    oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck').oasOpFormDataConsumeCheck,
    oasOpParams: require('./functions/oasOpParams').oasOpParams,
  };
};

export const commonOasRules = (): RuleCollection => ({
  // Custom Rules

  'operation-2xx-response': {
    summary: 'Operation must have at least one `2xx` response.',
    type: RuleType.STYLE,
    given: operationPath,
    then: {
      field: 'responses',
      function: 'oasOp2xxResponse',
    },
    tags: ['operation'],
  },
  'operation-formData-consume-check': {
    summary:
      'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
    type: RuleType.VALIDATION,
    given: operationPath,
    then: {
      function: 'oasOpFormDataConsumeCheck',
    },
    tags: ['operation'],
  },
  'operation-operationId-unique': {
    summary: 'Every operation must have a unique `operationId`.',
    type: RuleType.VALIDATION,
    severity: DiagnosticSeverity.Error,
    given: '$',
    then: {
      function: 'oasOpIdUnique',
    },
    tags: ['operation'],
  },

  'operation-parameters': {
    summary: 'Operation parameters are unique and non-repeating.',
    type: RuleType.VALIDATION,
    given: '$',
    then: {
      function: 'oasOpParams',
    },
    tags: ['operation'],
  },
  'path-params': {
    summary: 'Path parameters are correct and valid.',
    message: '{{error}}',
    type: RuleType.VALIDATION,
    severity: DiagnosticSeverity.Error,
    given: '$',
    then: {
      function: 'oasPathParam',
    },
    tags: ['given'],
  },

  // Generic Rules
  'contact-properties': {
    enabled: false,
    summary: 'Contact object should have `name`, `url` and `email`.',
    type: RuleType.STYLE,
    given: '$.info.contact',
    then: [
      {
        field: 'name',
        function: RuleFunction.TRUTHY,
      },
      {
        field: 'url',
        function: RuleFunction.TRUTHY,
      },
      {
        field: 'email',
        function: RuleFunction.TRUTHY,
      },
    ],
    tags: ['api'],
  },
  'example-value-or-externalValue': {
    enabled: false,
    summary: 'Example should have either a `value` or `externalValue` field.',
    type: RuleType.STYLE,
    given: '$..example',
    then: {
      function: RuleFunction.XOR,
      functionOptions: {
        properties: ['externalValue', 'value'],
      },
    },
  },
  'info-contact': {
    summary: 'Info object should contain `contact` object.',
    type: RuleType.STYLE,
    given: '$',
    then: {
      field: 'info.contact',
      function: RuleFunction.TRUTHY,
    },
    tags: ['api'],
  },
  'info-description': {
    summary: 'OpenAPI object info `description` must be present and non-empty string.',
    type: RuleType.STYLE,
    given: '$',
    then: {
      field: 'info.description',
      function: RuleFunction.TRUTHY,
    },
    tags: ['api'],
  },
  'info-license': {
    enabled: false,
    summary: 'OpenAPI object info `license` must be present and non-empty string.',
    type: RuleType.STYLE,
    given: '$',
    then: {
      field: 'info.license',
      function: RuleFunction.TRUTHY,
    },
    tags: ['api'],
  },
  'license-url': {
    enabled: false,
    summary: 'License object should include `url`.',
    type: RuleType.STYLE,
    given: '$',
    then: {
      field: 'info.license.url',
      function: RuleFunction.TRUTHY,
    },
    tags: ['api'],
  },
  'no-eval-in-markdown': {
    enabled: false,
    summary: 'Markdown descriptions should not contain `eval(`.',
    type: RuleType.STYLE,
    given: '$..*',
    then: [
      {
        field: 'description',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: 'eval\\(',
        },
      },
      {
        field: 'title',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: 'eval\\(',
        },
      },
    ],
  },
  'no-script-tags-in-markdown': {
    summary: 'Markdown descriptions should not contain `<script>` tags.',
    type: RuleType.STYLE,
    given: '$..*',
    then: [
      {
        field: 'description',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: '<script',
        },
      },
      {
        field: 'title',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: '<script',
        },
      },
    ],
  },
  'only-local-references': {
    enabled: false,
    summary: 'References should start with `#/`.',
    type: RuleType.STYLE,
    given: "$..['$ref']",
    then: {
      function: RuleFunction.PATTERN,
      functionOptions: {
        match: '^#\\/',
      },
    },
    tags: ['references'],
  },
  'openapi-tags-alphabetical': {
    enabled: false,
    summary: 'OpenAPI object should have alphabetical `tags`.',
    type: RuleType.STYLE,
    given: '$',
    then: {
      field: 'tags',
      function: RuleFunction.ALPHABETICAL,
      functionOptions: {
        keyedBy: 'name',
      },
    },
    tags: ['api'],
  },
  'openapi-tags': {
    enabled: false,
    summary: 'OpenAPI object should have non-empty `tags` array.',
    type: RuleType.STYLE,
    given: '$',
    then: {
      field: 'tags',
      function: RuleFunction.TRUTHY,
    },
    tags: ['api'],
  },
  'operation-default-response': {
    enabled: false,
    summary: 'Operations must have a default response.',
    type: RuleType.STYLE,
    given: '$..paths.*.*.responses',
    then: {
      field: 'default',
      function: RuleFunction.TRUTHY,
    },
    tags: ['operation'],
  },
  'operation-description': {
    summary: 'Operation `description` must be present and non-empty string.',
    type: RuleType.STYLE,
    given: operationPath,
    then: {
      field: 'description',
      function: RuleFunction.TRUTHY,
    },
    tags: ['operation'],
  },
  'operation-operationId': {
    summary: 'Operation should have an `operationId`.',
    type: RuleType.STYLE,
    given: operationPath,
    then: {
      field: 'operationId',
      function: RuleFunction.TRUTHY,
    },
    tags: ['operation'],
  },
  'operation-operationId-valid-in-url': {
    summary: 'operationId may only use characters that are valid when used in a URL.',
    type: RuleType.VALIDATION,
    given: operationPath,
    then: {
      field: 'operationId',
      function: RuleFunction.PATTERN,
      functionOptions: {
        match: `^[A-Za-z0-9-._~:/?#\\[\\]@!\\$&'()*+,;=]*$`,
      },
    },
    tags: ['operation'],
  },
  'operation-singular-tag': {
    enabled: false,
    summary: 'Operation may only have one tag.',
    type: RuleType.STYLE,
    given: operationPath,
    then: {
      field: 'tags',
      function: RuleFunction.LENGTH,
      functionOptions: {
        max: 1,
      },
    },
    tags: ['operation'],
  },
  'operation-summary-formatted': {
    enabled: false,
    summary: 'Operation `summary` should start with upper case and end with a dot.',
    type: RuleType.STYLE,
    given: operationPath,
    then: {
      field: 'summary',
      function: RuleFunction.PATTERN,
      functionOptions: {
        match: '^[A-Z].*\\.$',
      },
    },
    tags: ['operation'],
  },
  'operation-tags': {
    summary: 'Operation should have non-empty `tags` array.',
    type: RuleType.STYLE,
    given: operationPath,
    then: {
      field: 'tags',
      function: RuleFunction.TRUTHY,
    },
    tags: ['operation'],
  },
  'parameter-description': {
    enabled: false,
    summary: 'Parameter objects should have a `description`.',
    type: RuleType.STYLE,
    given: '$..parameters[*]',
    when: {
      field: '@key',
      pattern: '^(?!.*(\\$ref))',
    },
    then: {
      field: 'description',
      function: RuleFunction.TRUTHY,
    },
    tags: ['parameters'],
  },
  'path-declarations-must-exist': {
    summary: 'given declarations cannot be empty, ex.`/given/{}` is invalid.',
    type: RuleType.STYLE,
    given: '$..paths',
    then: {
      field: '@key',
      function: RuleFunction.PATTERN,
      functionOptions: {
        notMatch: '{}',
      },
    },
    tags: ['given'],
  },
  'path-keys-no-trailing-slash': {
    summary: 'given keys should not end with a slash.',
    type: RuleType.STYLE,
    given: '$..paths',
    then: {
      field: '@key',
      function: RuleFunction.PATTERN,
      functionOptions: {
        notMatch: '.+\\/$',
      },
    },
    tags: ['given'],
  },
  'path-not-include-query': {
    summary: 'given keys should not include a query string.',
    type: RuleType.STYLE,
    given: '$..paths',
    then: {
      field: '@key',
      function: RuleFunction.PATTERN,
      functionOptions: {
        notMatch: '\\?',
      },
    },
    tags: ['given'],
  },
  'tag-description': {
    enabled: false,
    summary: 'Tag object should have a `description`.',
    type: RuleType.STYLE,
    given: '$.tags[*]',
    then: {
      field: 'description',
      function: RuleFunction.TRUTHY,
    },
    tags: ['api'],
  },
});
