const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from '../../types';
import { commonOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas2Functions } from '../oas';

export const oas2Rules = () => {
  return merge(commonOasRules(), {
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
  });
};
