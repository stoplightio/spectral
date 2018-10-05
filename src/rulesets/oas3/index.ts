const merge = require('lodash.merge');

import { IRuleset } from '../../types';
import { commonOasRuleset } from '../oas';
import * as schema from './schemas/main.json';

export const oas3Ruleset = (): IRuleset => {
  return merge(commonOasRuleset(), {
    name: 'oas3',
    rules: {
      oas3: {
        'oas3-schema': {
          type: 'validation',
          summary: 'Validate structure of OpenAPIv3 specification.',
          enabled: true,
          severity: 'error',
          path: '$',
          function: 'schema',
          input: {
            schema,
          },
        },
      },
    },
  });
};
