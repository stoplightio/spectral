import { createRulesetFunction } from '@stoplight/spectral-core';
import { oas2, oas3_1 } from '@stoplight/spectral-formats';
import _oasDocumentSchema from './_oasDocumentSchema';

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function oasDocumentSchema(input, _opts, context) {
    const formats = context.document.formats;
    if (formats === null || formats === void 0) return;

    const format = formats.has(oas2) ? 'oas2_0' : formats.has(oas3_1) ? 'oas3_1' : 'oas3_0';

    return _oasDocumentSchema(format, input);
  },
);
