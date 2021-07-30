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
import requireResolve from './requireResolve';
import { Ruleset } from './validation/types';

async function read(filepath: string, fs: MigrationOptions['fs'], fetch: Fetch): Promise<Ruleset> {
  const input = isURL(filepath)
    ? await (await fetch(filepath)).text()
    : await fs.promises.readFile(requireResolve?.(filepath) ?? filepath, 'utf8');

  const { data: ruleset } = (extname(filepath) === '.json' ? parseJsonWithPointers : parseYamlWithPointers)<unknown>(
    input,
  );

  assertRuleset(ruleset);
  return ruleset;
}

export async function migrateRuleset(filepath: string, opts: MigrationOptions): Promise<string> {
  const { fs, fetch = defaultFetch, format, npmRegistry, scope = new Scope() } = opts;
  const cwd = dirname(filepath);
  const tree = new Tree({
    cwd,
    format,
    npmRegistry,
    scope,
  });

  const ruleset = await read(filepath, fs, fetch);
  const hooks = new Set<Hook>();
  const ctx: TransformerCtx = {
    cwd,
    tree,
    opts: {
      scope,
      fetch,
      ...opts,
    },
    hooks,
    read,
  };

  for (const transformer of transformers) {
    transformer(ctx);
  }

  tree.ruleset = await process(ruleset, hooks);

  return tree.toString();
}

async function _process(input: unknown, hooks: Set<Hook>, path: string): Promise<ExpressionKind | null> {
  for (const [pattern, fn] of hooks) {
    if (pattern.test(path)) {
      const output = await fn(input);

      if (output !== void 0) {
        return output;
      }
    }
  }

  if (Array.isArray(input)) {
    return b.arrayExpression(
      (await Promise.all(input.map((item, i) => _process(item, hooks, `${path}/${String(i)}`)))).filter(Boolean),
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
          const propertyValue = await _process(value, hooks, `${path}/${key}`);

          if (propertyValue !== null) {
            return b.property('init', b.identifier(JSON.stringify(key)), propertyValue);
          }

          return null;
        }),
      )
    ).filter(Boolean) as namedTypes.Property[],
  );
}

export async function process(input: unknown, hooks: Set<Hook>): Promise<namedTypes.ObjectExpression> {
  return (await _process(input, hooks, '')) as namedTypes.ObjectExpression;
}
