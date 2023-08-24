import ruleset from './indirect.3';
import {falsy} from "@stoplight/spectral-functions";

export default {
  extends: ruleset,
  rules: {
    'bar-rule': {
      given: '$',
      then: {
        function: falsy,
      },
    },
  },
};
