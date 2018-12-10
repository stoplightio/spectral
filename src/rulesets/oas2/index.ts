const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from '../../types';
import { commonOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas2Functions } from '../oas';

export const oas2Rules = () => {
  return merge(commonOasRules(), {
    // specification validation
    'oas2-schema': {
      summary: 'Validate structure of OpenAPIv2 specification.',
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
  });
};
