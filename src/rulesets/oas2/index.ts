import { DiagnosticSeverity } from '@stoplight/types';
import merge = require('lodash/merge');
import { RuleCollection, RuleFunction, RuleType } from '../../types';
import { commonOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas2Functions } from '../oas';

export const oas2Rules = () => {
  return merge<RuleCollection, RuleCollection>(commonOasRules(), {
    // specification validation
    'oas2-schema': {
      summary: 'Validate structure of OpenAPIv2 specification.',
      type: RuleType.VALIDATION,
      severity: DiagnosticSeverity.Error,
      given: '$',
      then: {
        function: RuleFunction.SCHEMA,
        functionOptions: {
          schema,
        },
      },
      tags: ['schema'],
    },

    // generic
    'api-host': {
      summary: 'OpenAPI `host` must be present and non-empty string.',
      type: RuleType.STYLE,
      given: '$',
      then: {
        field: 'host',
        function: RuleFunction.TRUTHY,
      },
      tags: ['api'],
    },
    'api-schemes': {
      summary: 'OpenAPI host `schemes` must be present and non-empty array.',
      type: RuleType.STYLE,
      given: '$',
      then: {
        field: 'schemes',
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
      tags: ['api'],
    },
    'host-not-example': {
      enabled: false,
      summary: 'Server URL should not point at `example.com`.',
      type: RuleType.STYLE,
      given: '$',
      then: {
        field: 'host',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: 'example.com',
        },
      },
    },
    'host-trailing-slash': {
      summary: 'Server URL should not have a trailing slash.',
      type: RuleType.STYLE,
      given: '$',
      then: {
        field: 'host',
        function: RuleFunction.PATTERN,
        functionOptions: {
          notMatch: '/$',
        },
      },
    },
    'model-description': {
      enabled: false,
      summary: 'Definition `description` must be present and non-empty string.',
      type: RuleType.STYLE,
      given: '$..definitions[*]',
      then: {
        field: 'description',
        function: RuleFunction.TRUTHY,
      },
    },
    'operation-security-defined': {
      summary: 'Operation `security` values must match a scheme defined in the `securityDefinitions` object.',
      type: RuleType.VALIDATION,
      given: '$',
      then: {
        function: 'oasOpSecurityDefined',
        functionOptions: {
          schemesPath: ['securityDefinitions'],
        },
      },
      tags: ['operation'],
    },
    'valid-example': {
      summary: 'Examples must be valid against their defined schema.',
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
