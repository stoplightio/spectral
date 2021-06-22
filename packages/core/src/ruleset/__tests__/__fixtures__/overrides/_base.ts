import { pattern } from '@stoplight/spectral-functions';
import { DiagnosticSeverity } from '@stoplight/types';

export default {
  rules: {
    'description-matches-stoplight': {
      message: 'Description must contain Stoplight',
      given: '$.info',
      recommended: true,
      severity: DiagnosticSeverity.Error,
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
  },
};
