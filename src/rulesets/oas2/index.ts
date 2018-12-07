const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from '../../types';
import { allOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas2Functions } from '../oas';

export const oas2Rules = () => {
  return merge(allOasRules(), {
    oas2: {
      'oas2-schema': {
        type: RuleType.VALIDATION,
        summary: 'Validate structure of OpenAPIv2 specification.',
        enabled: true,
        severity: ValidationSeverity.Error,
        given: '$',
        then: {
          function: RuleFunction.SCHEMA,
          functionOptions: {
            schema,
          },
        },
        tags: ['validation'],
      },
    },
  });
};
