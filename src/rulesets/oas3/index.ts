const merge = require('lodash/merge');

import { DiagnosticSeverity } from '@stoplight/types';
import { RuleFunction, RuleType } from '../../types';
import { commonOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas3Functions } from '../oas';

export const oas3Rules = () => {
  return merge(commonOasRules(), {
    // specification validation
    'oas3-schema': {
      message: '{{error}}',
      type: RuleType.VALIDATION,
      severity: DiagnosticSeverity.Error,
      then: {
        function: RuleFunction.SCHEMA,
        functionOptions: {
          schema,
        },
      },
      tags: ['schema'],
    },

    // generic rules
    'api-servers': {
      message: 'OpenAPI `servers` must be present and non-empty array.',
      type: RuleType.STYLE,
      given: '$',
      then: {
        field: 'servers',
        function: RuleFunction.SCHEMA,
        functionOptions: {
          schema: {
            items: {
              type: 'object',
            },
            minItems: 1,
            type: 'array',
          },
        },
      },
      tags: ['api'],
    },
    'model-description': {
      enabled: false,
      message: 'Model `description` must be present and non-empty string.',
      type: RuleType.STYLE,
      given: '$.components.schemas[*]',
      then: {
        field: 'description',
        function: RuleFunction.TRUTHY,
      },
    },
    'operation-security-defined': {
      message: 'Operation `security` values must match a scheme defined in the `components.securitySchemes` object.',
      type: RuleType.VALIDATION,
      given: '$',
      then: {
        function: 'oasOpSecurityDefined',
        functionOptions: {
          schemesPath: ['components', 'securitySchemes'],
        },
      },
      tags: ['operation'],
    },
    'server-not-example.com': {
      enabled: false,
      message: 'Server URL should not point at `example.com`.',
      type: RuleType.STYLE,
      given: '$.servers[*]',
      then: {
        field: 'url',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: 'example.com',
        },
      },
    },
    'server-trailing-slash': {
      message: 'Server URL should not have a trailing slash.',
      type: RuleType.STYLE,
      given: '$.servers[*]',
      then: {
        field: 'url',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: '/$',
        },
      },
    },
    'valid-example': {
      message: '"{{property}}" property {{error}}',
      type: RuleType.VALIDATION,
      given: '$..[?(@.example)]',
      then: {
        function: RuleFunction.SCHEMAPATH,
        functionOptions: {
          field: 'example',
          schemaPath: '$',
        },
      },
    },
  });
};
