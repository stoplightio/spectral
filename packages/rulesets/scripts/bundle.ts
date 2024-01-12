import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';
import * as path from 'path';
import sucrase from '@rollup/plugin-sucrase';

const cwd = path.join(__dirname, '..');

rollup({
  input: path.join(cwd, 'src/oas/functions/_oasDocumentSchema.ts'),
  plugins: [
    sucrase({
      transforms: ['typescript'],
    }),
    terser({
      ecma: 2020,
      module: true,
      compress: {
        passes: 2,
      },
      mangle: {
        // properties: true,
        // reserved: ['message', 'path'],
      },
    }),
  ],
  treeshake: true,
  watch: false,
  perf: false,
  external: ['@stoplight/spectral-core', '@stoplight/json', 'leven'],
}).then(bundle =>
  bundle.write({
    format: 'commonjs',
    exports: 'default',
    sourcemap: true,
    file: path.join(cwd, 'dist/oas/functions/_oasDocumentSchema.js'),
  }),
);
