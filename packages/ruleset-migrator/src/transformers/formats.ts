import { namedTypes, builders as b } from 'ast-types';
import type { Hook, Transformer, TransformerCtx } from '../types';
import { isString } from '../utils/guards';
import { raiseError } from '../utils/ast';

function toFormat(format: string): string {
  return format
    .replace(/\.|(?<=[0-9])-(?=[0-9])/g, '_')
    .replace(/-([0-9a-z])/g, (match, char) => String(char).toUpperCase());
}

const REPLACEMENTS = new Proxy<Record<string, string>>(
  {
    'json-schema-2019-09': toFormat('json-schema-draft-2019-09'),
    'json-schema-2020-12': toFormat('json-schema-draft-2020-12'),
  },
  {
    get(target, format: string): string {
      target[format] ??= toFormat(format);
      return target[format];
    },
  },
);

function createMissingFormatError(name: string): namedTypes.CallExpression {
  return raiseError(`Format "${name}" is not defined`);
}

function transform(
  format: string,
  ctx: TransformerCtx,
): namedTypes.Identifier | namedTypes.LogicalExpression | namedTypes.CallExpression {
  const actualFormat = REPLACEMENTS[format];
  const availableStaticModules = ctx.tree.modules.listStaticModules('format');

  if (availableStaticModules.length === 0) {
    return b.logicalExpression(
      '||',
      ctx.tree.addImport(actualFormat, '@stoplight/spectral-formats'),
      createMissingFormatError(format),
    );
  }

  const resolved = ctx.tree.modules.resolveStaticModule('format', actualFormat);
  return resolved === null ? createMissingFormatError(format) : ctx.tree.addImport(actualFormat, resolved);
}

function dedupeFormats(formats: unknown[]): void {
  const seen = new Set<string>();
  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    if (!isString(format)) continue;

    const actualFormat = REPLACEMENTS[format];
    if (seen.has(actualFormat)) {
      formats.splice(i, 1);
      i--;
      continue;
    }

    seen.add(actualFormat);
  }
}

export { transformer as default };

const transformer: Transformer = function (hooks) {
  hooks.add(<Hook<unknown[]>>[/^\/aliases\/[^/]+\/targets\/\d+\/formats$/, Array.isArray, dedupeFormats]);
  hooks.add(<Hook<unknown[]>>[/^(\/overrides\/\d+)?\/formats$/, Array.isArray, dedupeFormats]);
  hooks.add(<Hook<unknown[]>>[/^(\/overrides\/\d+)?\/rules\/[^/]+\/formats$/, Array.isArray, dedupeFormats]);

  hooks.add(<Hook<string>>[/^\/aliases\/[^/]+\/targets\/\d+\/formats\/[^/]+$/, isString, transform]);
  hooks.add(<Hook<string>>[/^(\/overrides\/\d+)?\/formats\/[^/]+$/, isString, transform]);
  hooks.add(<Hook<string>>[/^(\/overrides\/\d+)?\/rules\/[^/]+\/formats\/[^/]+$/, isString, transform]);
};
