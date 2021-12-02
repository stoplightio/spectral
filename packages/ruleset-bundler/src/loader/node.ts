import { createRequire } from 'module';
import * as path from '@stoplight/path';
import { Ruleset, RulesetDefinition } from '@stoplight/spectral-core';

import { bundle } from './common/bundle';
import { node } from '../presets/node';
import type { Loader } from './types';

export const bundleAndLoadRuleset: Loader = async (rulesetFile, io) => {
  const ruleset = await bundle(
    rulesetFile,
    {
      target: 'node',
      format: 'commonjs',
      plugins: node(io),
    },
    io,
  );

  return new Ruleset(load(ruleset, rulesetFile), {
    severity: 'recommended',
    source: rulesetFile,
  });
};

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

  if (typeof m.exports !== 'object' || m.exports === null) {
    throw Error('No valid export found');
  }

  return m.exports;
}
