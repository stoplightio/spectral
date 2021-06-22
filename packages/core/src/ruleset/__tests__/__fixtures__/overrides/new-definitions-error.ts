import _base from './_base';
import { RulesetDefinition } from '../../../types';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: _base,
  overrides: [
    {
      files: ['legacy/**/*.json'],
      rules: {
        'new-definition': {
          given: '$',
          then: {
            function() {},
          },
        },
      },
    },
    {
      files: ['v2/**/*.json'],
      rules: {
        'new-definition': 'off', // errors
      },
    },
  ],
};
