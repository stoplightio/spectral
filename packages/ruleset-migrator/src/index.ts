import { parseWithPointers as parseJsonWithPointers, safeStringify } from '@stoplight/json';
import { parseWithPointers as parseYamlWithPointers } from '@stoplight/yaml';
import { extname, isURL } from '@stoplight/path';
import { fetch } from '@stoplight/spectral-runtime';
import { Hook, MigrationOptions, TransformerCtx } from './types';
import transformers from './transformers';
import { Tree } from './tree';
import { builders as b, namedTypes } from 'ast-types';
import { ExpressionKind } from 'ast-types/gen/kinds';
import { assertRuleset } from './validation';
import requireResolve from './requireResolve';

export async function migrateRuleset(filepath: string, { fs, format, npmRegistry }: MigrationOptions): Promise<string> {
  const input = isURL(filepath)
    ? await (await fetch(filepath)).text()
    : await fs.promises.readFile(requireResolve?.(filepath) ?? filepath, 'utf8');
  const { data: ruleset } = (extname(filepath) === '.json' ? parseJsonWithPointers : parseYamlWithPointers)<unknown>(
    input,
  );

  assertRuleset(ruleset);

  const tree = new Tree({ npmRegistry, format });
  const hooks = new Set<Hook>();
  const ctx: TransformerCtx = {
    tree,
    ruleset,
    hooks,
  };

  for (const transformer of transformers) {
    transformer(ctx);
  }

  tree.ruleset = process(ruleset, hooks, '') as namedTypes.ObjectExpression;

  return tree.toString();
}

function process(input: unknown, hooks: Set<Hook>, path: string): ExpressionKind | null {
  for (const [pattern, fn] of hooks) {
    if (pattern.test(path)) {
      return fn(input);
    }
  }

  if (Array.isArray(input)) {
    return b.arrayExpression(input.map((item, i) => process(item, hooks, `${path}/${String(i)}`)).filter(Boolean));
  } else if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'string') {
    return b.literal(input);
  } else if (typeof input !== 'object') {
    throw new Error(`Cannot dump ${safeStringify(input) ?? '<unknown value>'}`);
  }

  if (input === null) {
    return b.literal(null);
  }

  return b.objectExpression(
    Object.entries(input).reduce<namedTypes.Property[]>((properties, [key, value]) => {
      const propertyValue = process(value, hooks, `${path}/${key}`);

      if (propertyValue !== null) {
        properties.push(b.property('init', b.identifier(JSON.stringify(key)), propertyValue));
      }

      return properties;
    }, []),
  );
}
