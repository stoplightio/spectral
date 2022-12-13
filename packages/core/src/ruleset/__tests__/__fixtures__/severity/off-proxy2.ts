import { DiagnosticSeverity } from '@stoplight/types';
import { truthy } from '@stoplight/spectral-functions';

const ruleset1 = {
  rules: {
    'custom-info-description': {
      message: 'API Description is missing',
      severity: DiagnosticSeverity.Error,
      given: '$.info',
      then: {
        field: 'description',
        function: truthy,
      },
    },
  },
};

const ruleset2 = {
  extends: [ruleset1],
  rules: {},
};

export default {
  extends: [[ruleset2, 'off']],
  rules: {},
};
