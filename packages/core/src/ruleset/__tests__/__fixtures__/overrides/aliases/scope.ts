import { DiagnosticSeverity } from '@stoplight/types';
import {falsy, pattern, truthy} from '@stoplight/spectral-functions';
import { RulesetDefinition } from '@stoplight/spectral-core';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  aliases: {
    Stoplight: '$..stoplight',
  },
  overrides: [
    {
      files: ['*.yaml'],
      rules: {
        'value-matches-stoplight': {
          message: 'Value must contain Stoplight',
          given: '#Stoplight',
          severity: DiagnosticSeverity.Error,
          then: {
            field: 'description',
            function: pattern,
            functionOptions: {
              match: 'Stoplight',
            },
          },
        },
      },
    },
    {
      files: ['**/*.json'],
      aliases: {
        Value: '$..value',
      },
      rules: {
        'truthy-stoplight-property': {
          message: 'Value must contain Stoplight',
          given: '#Value',
          severity: DiagnosticSeverity.Error,
          then: {
            function: truthy,
          },
        },
      },
    },
    {
      files: ['legacy/**/*.json'],
      rules: {
        'falsy-value': {
          given: '#Value',
          severity: DiagnosticSeverity.Warning,
          then: {
            function: falsy,
          },
        },
      },
    },
  ],
};
