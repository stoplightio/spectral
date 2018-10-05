const merge = require('lodash.merge');

import { IRuleset } from '../../types';
import { commonOasRuleset } from '../oas';
import * as schema from './schemas/main.json';

export const oas2Ruleset = (): IRuleset => {
  return merge(commonOasRuleset(), {
    name: 'oas2',
    rules: {
      oas2: {
        'oas2-schema': {
          type: 'validation',
          summary: 'Validate structure of OpenAPIv2 specification.',
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
