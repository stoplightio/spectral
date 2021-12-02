import { Ruleset } from '@stoplight/spectral-core';

import { bundle } from './common/bundle';
import { runtime } from '../presets/runtime';
import type { Loader } from './types';

export const bundleAndLoadRuleset: Loader = async (rulesetFile, io) => {
  const ruleset = await bundle(
    rulesetFile,
    {
      format: 'iife',
      target: 'runtime',
      plugins: runtime(io),
    },
    io,
  );

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Ruleset(Function(`return ${ruleset}`)(), {
    severity: 'recommended',
    source: rulesetFile,
  });
};
