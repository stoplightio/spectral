import { Optional } from '@stoplight/types';
import { Ruleset, RulesetDefinition } from '@stoplight/spectral-core';
import * as fs from 'fs';
import * as path from '@stoplight/path';
import * as process from 'process';
import { createRequire } from 'module';
import { extname } from '@stoplight/path';
import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
import { bundleRuleset } from '@stoplight/spectral-ruleset-bundler';
import { node } from '@stoplight/spectral-ruleset-bundler/presets/node';
import { fetch } from '@stoplight/spectral-runtime';
import { stdin } from '@stoplight/spectral-ruleset-bundler/plugins/stdin';
import { builtins } from '@stoplight/spectral-ruleset-bundler/plugins/builtins';
import { isObject } from 'lodash';
import * as commonjs from '@rollup/plugin-commonjs';

async function getDefaultRulesetFile(): Promise<Optional<string>> {
  const cwd = process.cwd();
  for (const filename of await fs.promises.readdir(cwd)) {
    if (Ruleset.isDefaultRulesetFile(filename)) {
      return path.join(cwd, filename);
    }
  }

  return;
}

function isLegacyRuleset(filepath: string): boolean {
  return /\.(json|ya?ml)$/.test(extname(filepath));
}

export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
  if (rulesetFile === void 0) {
    rulesetFile = await getDefaultRulesetFile();
  } else if (!path.isAbsolute(rulesetFile)) {
    rulesetFile = path.join(process.cwd(), rulesetFile);
  }

  if (rulesetFile === void 0) {
    throw new Error(
      'No ruleset has been found. Please provide a ruleset using the --ruleset CLI argument, or make sure your ruleset file matches .?spectral.(js|ya?ml|json)',
    );
  }

  let ruleset: string;

  if (isLegacyRuleset(rulesetFile)) {
    const migratedRuleset = await migrateRuleset(rulesetFile, {
      format: 'esm',
      fs,
    });

    rulesetFile = path.join(path.dirname(rulesetFile), '.spectral.js');

    ruleset = await bundleRuleset(rulesetFile, {
      target: 'node',
      format: 'commonjs',
      plugins: [
        stdin(migratedRuleset, rulesetFile),
        builtins(),
        // sigh, 2021 and we still do not use ESM
        (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
        ...node({ fs, fetch }),
      ],
    });
  } else {
    ruleset = await bundleRuleset(rulesetFile, {
      target: 'node',
      format: 'commonjs',
      plugins: [
        builtins(),
        (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
        ...node({ fs, fetch }),
      ],
    });
  }

  return new Ruleset(load(ruleset, rulesetFile), {
    severity: 'recommended',
    source: rulesetFile,
  });
}

function load(source: string, uri: string): RulesetDefinition {
  const actualUri = path.isURL(uri) ? uri.replace(/^https?:\//, '') : uri;
  // we could use plain `require`, but this approach has a number of benefits:
  // - it is bundler-friendly
  // - ESM compliant
  // - and we have no warning raised by pkg.
  const req = createRequire(actualUri);
  const m: { exports?: RulesetDefinition } = {};
  const paths = [path.dirname(uri), __dirname];

  const _require = (id: string): unknown => req(req.resolve(id, { paths }));

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  Function('module, require', source)(m, _require);

  if (!isObject(m.exports)) {
    throw Error('No valid export found');
  }

  return m.exports;
}
