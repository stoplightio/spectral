import { oas } from '@stoplight/spectral-rulesets';
export default {
  extends: oas,
  overrides: [
    {
      files: ['**#/info'],
      rules: {
        'info-contact': 'off',
        'info-description': 'off',
      },
    },
  ],
};
