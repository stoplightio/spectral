import { pattern } from '@stoplight/spectral-functions';
import { DiagnosticSeverity } from '@stoplight/types';
import { RulesetDefinition } from '@stoplight/spectral-core';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  aliases: {
    infoSection: ['$.info'],
  },
  rules: {
    'check-initial-version': {
      message: 'API version must be 1.0.0',
      given: '#infoSection',
      severity: DiagnosticSeverity.Error,
      then: {
        field: 'version',
        function: pattern,
        functionOptions: {
          match: '^1\\.0\\.0$',
        },
      },
    },
  },
};
