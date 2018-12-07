const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from '../../types';
import { allOasRules } from '../oas';
import * as schema from './schemas/main.json';

export { commonOasFunctions as oas3Functions } from '../oas';

export const oas3Rules = () => {
  return merge(allOasRules(), {
    oas3: {
      'oas3-schema': {
        type: RuleType.VALIDATION,
        summary: 'Validate structure of OpenAPIv3 specification.',
        enabled: true,
        severity: ValidationSeverity.Error,
        path: '$',
        function: RuleFunction.SCHEMA,
        input: {
          schema,
        },
        tags: ['validation'],
      },
    },
  });
};
