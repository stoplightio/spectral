const merge = require('lodash.merge');

import { IPreset } from '../../types';
import { preset as commonOas } from '../oas';
import * as schema from './schemas/main.json';

export const oas2Preset = (): IPreset => {
  return {
    name: 'oas2',
    rules: merge(commonOas().rules, {
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
    }),
  };
};
