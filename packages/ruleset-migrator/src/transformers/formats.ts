import { builders as b, namedTypes } from 'ast-types';
import { Transformer, TransformerCtx } from '../types';
import { assertArray, assertString } from '../validation';

const ALIASES: Record<string, string> = {
  'json-schema-2019-09': 'json-schema-draft-2019-09',
  'json-schema-2020-12': 'json-schema-draft-2020-12',
};

const FORMATS = [
  'oas2',
  'oas3',
  'oas3.0',
  'oas3.1',
  'asyncapi2',
  'json-schema',
  'json-schema-loose',
  'json-schema-draft4',
  'json-schema-draft6',
  'json-schema-draft7',
  'json-schema-draft-2019-09',
  'json-schema-2019-09',
  'json-schema-draft-2020-12',
  'json-schema-2020-12',
];

function safeFormat(format: string): string {
  return format
    .replace(/\.|([0-9])-(?=[0-9])/g, '$1_')
    .replace(/-([0-9a-z])/g, (match, char) => String(char).toUpperCase());
}

const REPLACEMENTS = Object.fromEntries(FORMATS.map(format => [format, safeFormat(ALIASES[format] ?? format)]));

function transform(input: unknown, ctx: TransformerCtx): namedTypes.ArrayExpression {
  assertArray(input);

  return b.arrayExpression(
    Array.from(
      new Set(
        input.map(format => {
          assertString(format);
          return ctx.tree.addImport(REPLACEMENTS[format] ?? safeFormat(format), '@stoplight/spectral-formats');
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
