import { jsonSchemaDraft2019_09, jsonSchemaDraft2020_12 } from '@stoplight/spectral-formats';
import { truthy } from '@stoplight/spectral-functions';
export default {
  formats: [jsonSchemaDraft2019_09, jsonSchemaDraft2020_12],
  rules: {
    test: {
      given: '$',
      then: {
        function: truthy,
      },
    },
  },
};
