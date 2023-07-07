import { Ruleset } from '../../../ruleset';
import { DiagnosticSeverity } from '@stoplight/types';
import { defined } from '@stoplight/spectral-functions';

export default new Ruleset({
  rules: {
    'error-code-defined': {
      message: '`code` property is missing in the Error object definition',
      severity: DiagnosticSeverity.Error,
      given:
        "$.paths.*.*.responses[?(@property.match(/^(4|5)/))].content.'application/json'.schema.properties.error.properties",
      then: {
        field: 'code',
        function: defined,
      },
    },
  },
});
