const merge = require('lodash.merge');

import { IPreset } from '../../types';
import { preset as commonOas } from '../oas';
import * as schema from './schemas/main.json';

export const oas3Preset = (): IPreset => {
  return {
    name: 'oas3',
    rules: merge(commonOas().rules, {
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
    }),
  };
};
