import { RulesetDefinition } from '@stoplight/spectral-core';

import { Format } from '../../../format';
import _base from './_base';

export const draftA: Format = () => false;
export const draftB: Format = () => false;

export { ruleset as default };

const ruleset: RulesetDefinition = {
  rules: {
    ..._base.rules,
  },
  overrides: [
    {
      formats: [draftA],
      rules: {
        'title-matches-stoplight': 'off',
      },
    },
    {
      formats: [draftB],
      rules: {
        'description-matches-stoplight': 'info',
      },
    },
    {
      files: ['legacy/**/*.json'],
      formats: [draftB],
      rules: {
        'description-matches-stoplight': 'hint',
      },
    },
  ],
};
