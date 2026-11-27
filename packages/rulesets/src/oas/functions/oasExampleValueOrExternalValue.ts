import { createRulesetFunction } from '@stoplight/spectral-core';
import { oas3_2 } from '@stoplight/spectral-formats';

const OAS3_VALUE_FIELDS = ['value', 'externalValue'];

// OpenAPI 3.2 added dataValue and serializedValue to the Example Object.
// Which combinations are allowed is checked by oas3-schema, so here it is enough
// to require at least one of these fields.
const OAS3_2_VALUE_FIELDS = ['value', 'dataValue', 'serializedValue', 'externalValue'];

export default createRulesetFunction<Record<string, unknown>, null>(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function oasExampleValueOrExternalValue(example, _opts, context) {
    const keys = Object.keys(example);

    if (context.document.formats?.has(oas3_2) === true) {
      if (keys.some(key => OAS3_2_VALUE_FIELDS.includes(key))) return;

      return [
        {
          message: 'Examples must have either "value", "dataValue", "serializedValue" or "externalValue" field.',
        },
      ];
    }

    if (keys.filter(key => OAS3_VALUE_FIELDS.includes(key)).length === 1) return;

    return [
      {
        message: 'Examples must have either "value" or "externalValue" field.',
      },
    ];
  },
);
