import _base from './_base';
import { RulesetDefinition } from '../../../types';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  rules: {
    ..._base.rules,
  },
  overrides: [
    {
      files: ['legacy/**/*.json'],
      rules: {
        'description-matches-stoplight': 'off',
        'title-matches-stoplight': 'warn',
      },
    },
    {
      files: ['v2/**/*.json'],
      rules: {
        'description-matches-stoplight': 'error',
        'title-matches-stoplight': 'hint',
      },
    },
  ],
};
