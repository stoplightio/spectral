import { parseWithPointers as parseJsonWithPointers, safeStringify } from '@stoplight/json';
import { parseWithPointers as parseYamlWithPointers } from '@stoplight/yaml';
import { fetch as defaultFetch } from '@stoplight/spectral-runtime';
import { dirname, extname, isURL } from '@stoplight/path';
import { Fetch, Hook, MigrationOptions, TransformerCtx } from './types';
import transformers from './transformers';
import { Scope, Tree } from './tree';
import { builders as b, namedTypes } from 'ast-types';
import { ExpressionKind } from 'ast-types/gen/kinds';
import { assertRuleset } from './validation';
import { Ruleset } from './validation/types';

export { isBasicRuleset } from './utils/isBasicRuleset';

async function read(filepath: string, fs: MigrationOptions['fs'], fetch: Fetch): Promise<Ruleset> {
  const input = isURL(filepath) ? await (await fetch(filepath)).text() : await fs.promises.readFile(filepath, 'utf8');

  const { data: ruleset } =
    extname(filepath) === '.json'
      ? parseJsonWithPointers<unknown>(input)
      : parseYamlWithPointers<unknown>(input, {
          mergeKeys: true,
        });

  assertRuleset(ruleset);
  return ruleset;
}

export async function migrateRuleset(filepath: string, opts: MigrationOptions): Promise<string> {
  const { fs, fetch = defaultFetch, format, npmRegistry } = opts;
  const cwd = dirname(filepath);
  const tree = new Tree({
    format,
    npmRegistry,
    scope: new Scope(),
  });

  const ruleset = await read(filepath, fs, fetch);
  const hooks = new Set<Hook>();
  const ctx: TransformerCtx = {
    cwd,
    filepath,
    tree,
    opts: {
      fetch,
      ...opts,
    },
    npmRegistry: npmRegistry ?? null,
    hooks,
    read,
  };

  for (const transformer of transformers) {
    transformer(ctx.hooks);
  }

  tree.ruleset = await process(ruleset, ctx);

  return tree.toString();
}

async function _process(input: unknown, ctx: TransformerCtx, path: string): Promise<ExpressionKind | null> {
  for (const [pattern, fn] of ctx.hooks) {
    if (pattern.test(path)) {
      const output = await fn(input, ctx);

      if (output !== void 0) {
        return output;
      }
    }
  }

  if (Array.isArray(input)) {
    return b.arrayExpression(
      (await Promise.all(input.map(async (item, i) => await _process(item, ctx, `${path}/${String(i)}`)))).filter(
        Boolean,
      ),
    );
  } else if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'string') {
    return b.literal(input);
  } else if (typeof input !== 'object') {
    throw new Error(`Cannot dump ${safeStringify(input) ?? '<unknown value>'}`);
  }

  if (input === null) {
    return b.literal(null);
  }

  return b.objectExpression(
    (
      await Promise.all(
        Object.entries(input).map(async ([key, value]) => {
          const propertyValue = await _process(value, ctx, `${path}/${key}`);

          if (propertyValue !== null) {
            return b.property('init', b.identifier(JSON.stringify(key)), propertyValue);
          }

          return null;
        }),
      )
    ).filter(Boolean) as namedTypes.Property[],
  );
}

export async function process(input: Ruleset, ctx: TransformerCtx): Promise<namedTypes.ObjectExpression> {
  return (await _process(input, ctx, '')) as namedTypes.ObjectExpression;
}
