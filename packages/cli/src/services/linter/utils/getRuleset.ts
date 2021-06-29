import { Optional } from '@stoplight/types';
import { Ruleset, RulesetDefinition } from '@stoplight/spectral-core';
import * as fs from 'fs';
import * as path from '@stoplight/path';
import * as process from 'process';
import { extname } from '@stoplight/path';
import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';

// eslint-disable-next-line @typescript-eslint/require-await
const AsyncFunction = (async (): Promise<void> => void 0).constructor as FunctionConstructor;

async function getDefaultRulesetFile(): Promise<Optional<string>> {
  const cwd = process.cwd();
  for (const filename of await fs.promises.readdir(cwd)) {
    if (Ruleset.isDefaultRulesetFile(filename)) {
      return path.join(cwd, filename);
    }
  }

  return;
}

export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
  if (rulesetFile === void 0) {
    rulesetFile = await getDefaultRulesetFile();
  } else if (!path.isAbsolute(rulesetFile)) {
    rulesetFile = path.join(process.cwd(), rulesetFile);
  }

  if (rulesetFile === void 0) {
    throw new Error('No ruleset has been provided');
  }

  let ruleset;

  if (/(json|ya?ml)$/.test(extname(rulesetFile))) {
    const m: { exports?: RulesetDefinition } = {};
    const paths = [path.dirname(rulesetFile)];

    await AsyncFunction(
      'module, require',
      await migrateRuleset(rulesetFile, {
        format: 'commonjs',
        fs,
      }),
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    )(m, (id: string) => require(require.resolve(id, { paths })) as unknown);

    ruleset = m.exports;
  } else {
    const imported = (await import(rulesetFile)) as { default: unknown } | unknown;
    ruleset =
      typeof imported === 'object' && imported !== null && 'default' in imported
        ? (imported as Record<'default', unknown>).default
        : imported;
  }

  return new Ruleset(ruleset, {
    severity: 'recommended',
    source: rulesetFile,
  });
}
