const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from '../../types';
import { commonOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas3Functions } from '../oas';

export const oas3Rules = () => {
  return merge(commonOasRules(), {
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
  });
};
