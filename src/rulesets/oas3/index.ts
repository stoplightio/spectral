const merge = require('lodash/merge');

import { ValidationSeverity } from '@stoplight/types/validations';
import { IRuleset, RuleFunction, RuleType } from '../../types';
import { commonOasRuleset } from '../oas';
import * as schema from './schemas/main.json';

export const oas3Ruleset = (): IRuleset => {
  return merge(commonOasRuleset(), {
    name: 'oas3',
    rules: {
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
    },
  });
};
