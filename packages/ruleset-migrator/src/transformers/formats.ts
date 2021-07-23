import { builders as b, namedTypes } from 'ast-types';
import { Transformer, TransformerCtx } from '../types';
import { assertArray, assertString } from '../validation';

const REPLACEMENTS = [
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
  'json-schema-draft-2020-12',
].reduce((replacements, id) => {
  replacements[id] = id
    .replace(/\.|(?<=[0-9])-(?=[0-9])/g, '_')
    .replace(/-([0-9a-z])/g, (match, char) => String(char).toUpperCase());
  return replacements;
}, {});

function transform(ctx: TransformerCtx, input: unknown): namedTypes.ArrayExpression {
  assertArray(input);

  return b.arrayExpression(
    input.map(format => {
      assertString(format);
      return ctx.tree.addImport(REPLACEMENTS[format], '@stoplight/spectral-formats');
    }),
  );
}

export { transformer as default };

const transformer: Transformer = function (ctx) {
  const t = transform.bind(null, ctx);

  ctx.hooks.add([/^(\/overrides\/\d+)?\/formats$/, t]);
  ctx.hooks.add([/^(\/overrides\/\d+)?\/rules\/[^/]+\/formats$/, t]);
};
