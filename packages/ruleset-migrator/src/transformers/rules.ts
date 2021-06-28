import { builders as b, namedTypes } from 'ast-types';
import * as functions from '@stoplight/spectral-functions';

import { Transformer } from '../types';
import { assertString } from '../validation';

export { transformer as default };

const KNOWN_FUNCTIONS = Object.keys(functions);

const REPLACEMENTS: Record<string, string> = {
  'operation-2xx-response': 'operation-default-response',
  'oas3-unused-components-schema': 'oas3-unused-components',

  // 'operation-default-response': null, no replacement for it

  'oas2-valid-parameter-example': 'oas2-valid-schema-example',
  'oas2-valid-response-schema-example': 'oas2-valid-schema-example',
  'oas2-valid-definition-example': 'oas2-valid-schema-example',

  'oas2-valid-response-example': 'oas2-valid-media-example',

  'oas3-valid-oas-parameter-example': 'oas3-valid-media-example',
  'oas3-valid-oas-content-example': 'oas3-valid-media-example',
  'oas3-valid-oas-header-example': 'oas3-valid-media-example',

  'oas3-valid-header-schema-example': 'oas3-valid-schema-example',
  'oas3-valid-parameter-schema-example': 'oas3-valid-schema-example',
};

const transformer: Transformer = function (ctx) {
  if (ctx.ruleset.rules === void 0) return;

  const { rules } = ctx.ruleset;

  for (const key of Object.keys(rules)) {
    if (!(key in REPLACEMENTS)) continue;
    rules[REPLACEMENTS[key]] = rules[key];
    delete rules[key];
  }

  ctx.hooks.add([
    /^\/rules\/[^/]+\/then\/(?:[0-9]+\/)?function$/,
    (value): namedTypes.Identifier => {
      assertString(value);

      return KNOWN_FUNCTIONS.includes(value)
        ? ctx.tree.addImport(value, '@stoplight/spectral-functions')
        : b.identifier(value);
    },
  ]);
};
