import { truthy, falsy } from "@stoplight/spectral-functions";
import pascalCase from "/.tmp/spectral/extends-variant-8/assets/shared/functions/pascalCase.js";
export default {
  extends: [
    {
      extends: [
        {
          rules: {
            'my-rule': {
              message: 'ruleset 2',
              given: '$',
              then: {
                function: falsy,
              },
            },
          },
        },
        {
          rules: {
            'my-rule': {
              message: 'ruleset 3',
              given: '$',
              then: {
                function: pascalCase,
              },
            },
          },
        },
      ],
      rules: {
        'my-rule': {
          message: 'ruleset',
          given: '$',
          then: {
            function: truthy,
          },
        },
      },
    },
  ],
};
