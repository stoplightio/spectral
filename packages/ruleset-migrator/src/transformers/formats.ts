import { builders as b, namedTypes } from 'ast-types';
import { Transformer, TransformerCtx } from '../types';
import { assertArray, assertString } from '../validation';

import schema from '../validation/schema';

const ALIASES: Record<string, string> = {
  'json-schema-2019-09': 'json-schema-draft-2019-09',
  'json-schema-2020-12': 'json-schema-draft-2020-12',
};

const REPLACEMENTS = Object.fromEntries(
  schema.properties.formats.items.enum.map(format => [
    format,
    (ALIASES[format] ?? format)
      .replace(/\.|(?<=[0-9])-(?=[0-9])/g, '_')
      .replace(/-([0-9a-z])/g, (match, char) => String(char).toUpperCase()),
  ]),
);

function transform(input: unknown, ctx: TransformerCtx): namedTypes.ArrayExpression {
  assertArray(input);

  return b.arrayExpression(
    Array.from(
      new Set(
        input.map(format => {
          assertString(format);
          return ctx.tree.addImport(REPLACEMENTS[format], '@stoplight/spectral-formats');
        }),
      ),
    ),
  );
}

export { transformer as default };

const transformer: Transformer = function (hooks) {
  hooks.add([/^\/aliases\/[^/]+\/targets\/\d+\/formats$/, transform]);
  hooks.add([/^(\/overrides\/\d+)?\/formats$/, transform]);
  hooks.add([/^(\/overrides\/\d+)?\/rules\/[^/]+\/formats$/, transform]);
};
