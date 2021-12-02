import { rollup, Plugin } from 'rollup';
import { isURL } from '@stoplight/path';
import { isValidPackageName } from './utils/isValidPackageName';

export type BundleOptions = {
  plugins: Plugin[];
  target: 'node' | 'browser' | 'runtime';
  format?: 'esm' | 'commonjs' | 'iife';
  treeshake?: boolean; // false by default
};

export { IO } from './types';

export async function bundleRuleset(
  input: string,
  { target = 'browser', plugins, format, treeshake = false }: BundleOptions,
): Promise<string> {
  const bundle = await rollup({
    input,
    plugins,
    treeshake,
    watch: false,
    perf: false,
    onwarn(e, fn) {
      if (e.code === 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') {
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
            id.startsWith('node:') ||
            (!isURL(id) && isValidPackageName(id) && (importer === void 0 || !isURL(importer))),
  });

  return (await bundle.generate({ format: format ?? (target === 'runtime' ? 'iife' : 'esm'), exports: 'auto' }))
    .output[0].code;
}
