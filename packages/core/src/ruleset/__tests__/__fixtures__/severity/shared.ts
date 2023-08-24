import { truthy, pattern } from '@stoplight/spectral-functions';
import type { RulesetDefinition } from '@stoplight/spectral-core';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  rules: {
    'description-matches-stoplight': {
      message: 'Description must contain Stoplight',
      given: '$.info',
      recommended: true,
      severity: 'error',
      then: {
        field: 'description',
        function: pattern,
        functionOptions: {
          match: 'Stoplight',
        },
      },
    },
    'title-matches-stoplight': {
      message: 'Title must contain Stoplight',
      given: '$.info',
      then: {
        field: 'title',
        function: pattern,
        functionOptions: {
          match: 'Stoplight',
        },
      },
    },
    'contact-name-matches-stoplight': {
      message: 'Contact name must contain Stoplight',
      given: '$.info.contact',
      recommended: false,
      then: {
        field: 'name',
        function: pattern,
        functionOptions: {
          match: 'Stoplight',
        },
      },
    },
    'overridable-rule': {
      given: '$',
      then: {
        function: truthy,
      },
    },
  },
};
