const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from '../../types';
import { commonOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas3Functions } from '../oas';

export const oas3Rules = () => {
  return merge(commonOasRules(), {
    // specification validation
    'oas3-schema': {
      summary: 'Validate structure of OpenAPIv3 specification.',
      type: RuleType.VALIDATION,
      severity: ValidationSeverity.Error,
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
      summary: 'OpenAPI `servers` must be present and non-empty array.',
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
      summary: 'Model `description` must be present and non-empty string.',
      type: RuleType.STYLE,
      given: '$.components.schemas[*]',
      then: {
        field: 'description',
        function: RuleFunction.TRUTHY,
      },
    },
    'operation-security-defined': {
      enabled: true,
      summary: 'Operation `security` values must match a scheme defined in the `components.securitySchemes` object.',
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
      summary: 'Server URL should not point at `example.com`.',
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
      summary: 'Server URL should not have a trailing slash.',
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
  });
};
