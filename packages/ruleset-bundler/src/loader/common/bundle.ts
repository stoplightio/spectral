import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
import * as path from '@stoplight/path';
import { ErrorWithCause } from 'pony-cause';

import { stdin } from '../../plugins/stdin';
import { isBasicRuleset, isErrorWithCode } from './utils';
import { bundleRuleset, BundleOptions, IO } from '../../index';

export async function bundle(rulesetFile: string, bundleOptions: BundleOptions, { fs }: IO): Promise<string> {
  try {
    if (isBasicRuleset(rulesetFile)) {
      const migratedRuleset = await migrateRuleset(rulesetFile, {
        format: 'esm',
        fs,
      });

      rulesetFile = path.join(path.dirname(rulesetFile), '.spectral.js');

      return await bundleRuleset(rulesetFile, {
        ...bundleOptions,
        plugins: [stdin(migratedRuleset, rulesetFile), ...bundleOptions.plugins],
      });
    } else {
      return await bundleRuleset(rulesetFile, bundleOptions);
    }
  } catch (e) {
    if (!isErrorWithCode(e) || e.code !== 'UNRESOLVED_ENTRY') {
      throw e;
    }

    throw new ErrorWithCause(`Could not read ruleset at ${rulesetFile}.`, { cause: e });
  }
}
