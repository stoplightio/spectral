import typescript from 'rollup-plugin-typescript2';
import * as path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const BASE_PATH = process.cwd();

const processor = (folder, array) => array.map(fn => ({
  input: path.resolve(BASE_PATH, folder, `${fn}.js`),
  plugins: [
    typescript({
      tsconfig: path.join(BASE_PATH, './tsconfig.rollup.json'),
      include: ['dist/**/*.{ts,tsx}'],
    }),
    resolve(),
    commonjs(),
    terser(),
  ],
  output: {
    file: path.resolve(BASE_PATH, folder, `${fn}.js`),
    format: 'cjs',
    exports: 'named'
  },
}));

module.exports = processor('dist/rulesets/oas/functions', [
  'oasOp2xxResponse',
  'oasOpFormDataConsumeCheck',
  'oasOpIdUnique',
  'oasOpParams',
  'oasOpSecurityDefined',
  'oasPathParam',
  'refSiblings',
])
.concat(processor('dist/rulesets/oas2/functions', [
  // Add here the oas2 specific functions
]))
.concat(processor('dist/rulesets/oas3/functions', [
  // Add here the oas3 specific functions
]));
