import { Optional } from '@stoplight/types';
import { Ruleset, RulesetDefinition } from '@stoplight/spectral-core';
import * as fs from 'fs';
import * as path from '@stoplight/path';
import * as process from 'process';
import { createRequire } from 'module';
import { fetch } from '@stoplight/spectral-runtime';
import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
import { bundleRuleset } from '@stoplight/spectral-ruleset-bundler';
import { node } from '@stoplight/spectral-ruleset-bundler/presets/node';
import { stdin } from '@stoplight/spectral-ruleset-bundler/plugins/stdin';
import { builtins } from '@stoplight/spectral-ruleset-bundler/plugins/builtins';
import { isError, isObject } from 'lodash';
import commonjs from '@rollup/plugin-commonjs';
import { CLIError } from '../../../errors';

async function getDefaultRulesetFile(): Promise<Optional<string>> {
  const cwd = process.cwd();
  for (const filename of await fs.promises.readdir(cwd)) {
    if (Ruleset.isDefaultRulesetFile(filename)) {
      return path.join(cwd, filename);
    }
  }

  return;
}

function isBasicRuleset(filepath: string): boolean {
  return /\.(json|ya?ml)$/.test(path.extname(filepath));
}

function isErrorWithCode(error: Error | (Error & { code: unknown })): error is Error & { code: string } {
  return 'code' in error && typeof error.code === 'string';
}

export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
  if (rulesetFile === void 0) {
    rulesetFile = await getDefaultRulesetFile();
  } else if (!path.isAbsolute(rulesetFile)) {
    rulesetFile = path.join(process.cwd(), rulesetFile);
  }

  if (rulesetFile === void 0) {
    throw new CLIError(
      'No ruleset has been found. Please provide a ruleset using the --ruleset CLI argument, or make sure your ruleset file matches .?spectral.(js|ya?ml|json)',
    );
  }

  let ruleset: string;

  try {
    if (isBasicRuleset(rulesetFile)) {
      const migratedRuleset = await migrateRuleset(rulesetFile, {
        format: 'esm',
        fs,
      });

      rulesetFile = path.join(path.dirname(rulesetFile), '.spectral.js');

      ruleset = await bundleRuleset(rulesetFile, {
        target: 'node',
        format: 'commonjs',
        plugins: [stdin(migratedRuleset, rulesetFile), builtins(), commonjs(), ...node({ fs, fetch })],
      });
    } else {
      ruleset = await bundleRuleset(rulesetFile, {
        target: 'node',
        format: 'commonjs',
        plugins: [builtins(), commonjs(), ...node({ fs, fetch })],
      });
    }
  } catch (e) {
    if (!isError(e) || !isErrorWithCode(e) || e.code !== 'UNRESOLVED_ENTRY') {
      throw e;
    }

    throw new CLIError(`Could not read ruleset at ${rulesetFile}.`);
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
    throw new CLIError('No valid export found');
  }

  return m.exports;
}
