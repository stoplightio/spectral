import { RulesetDefinition } from '../../../types';
import { DiagnosticSeverity } from '@stoplight/types';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  overrides: [
    {
      files: ['legacy/**/*.json'],
      rules: {},
      parserOptions: {
        incompatibleValues: DiagnosticSeverity.Hint,
      },
    },
    {
      files: ['v2/**/*.json'],
      rules: {},
      parserOptions: {
        incompatibleValues: DiagnosticSeverity.Warning,
        duplicateKeys: DiagnosticSeverity.Information,
      },
    },
  ],
};
