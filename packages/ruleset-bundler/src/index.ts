import { rollup, Plugin, OutputChunk } from 'rollup';
import { isURL } from '@stoplight/path';
import { isPackageImport } from './utils/isPackageImport';
import { dedupeRollupPlugins } from './utils/dedupeRollupPlugins';

export type BundleOptions = {
  plugins: Plugin[];
  target: 'node' | 'browser' | 'runtime';
  format?: 'esm' | 'commonjs' | 'iife';
  treeshake?: boolean; // false by default
  fullOutput?: boolean;
};

export { IO } from './types';

export async function bundleRuleset(
  input: string,
  opts: Omit<BundleOptions, 'fullOutput'> | (Omit<BundleOptions, 'fullOutput'> & { fullOutput: false }),
): Promise<string>;
export async function bundleRuleset(
  input: string,
  opts: Omit<BundleOptions, 'fullOutput'> & { fullOutput: true },
): Promise<OutputChunk>;
export async function bundleRuleset(
  input: string,
  { target = 'browser', plugins, format, treeshake = false, fullOutput = false }: BundleOptions,
): Promise<string | OutputChunk> {
  const bundle = await rollup({
    input,
    plugins: dedupeRollupPlugins(plugins),
    treeshake,
    watch: false,
    perf: false,
    onwarn(e, fn) {
      if (e.code === 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') {
        return;
      }
      // The Spectral packages themselves are not included in the bundle.
      if (
        e.code === 'UNRESOLVED_IMPORT' &&
        typeof e.source === 'string' &&
        e.source.startsWith('@stoplight/spectral')
      ) {
        return;
      }

      fn(e);
    },
    external:
      // the iife output is meant to be evaluated as a script type at the runtime, therefore it must not contain any import/exports, we must have the entire code ready to execute
      target === 'runtime'
        ? []
        : target === 'browser'
        ? id => isURL(id)
        : (id, importer) =>
            id.startsWith('node:') || (!isURL(id) && isPackageImport(id) && (importer === void 0 || !isURL(importer))),
  });

  const chunks = (await bundle.generate({ format: format ?? (target === 'runtime' ? 'iife' : 'esm'), exports: 'auto' }))
    .output;

  if (fullOutput) {
    return chunks[0];
  }

  return chunks[0].code;
}
