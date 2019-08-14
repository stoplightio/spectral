import typescript from 'rollup-plugin-typescript2';
import * as path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const BASE_PATH = process.cwd();

module.exports = [
  "oasOp2xxResponse",
  "oasOpFormDataConsumeCheck",
  "oasOpIdUnique",
  "oasOpParams",
  "oasOpSecurityDefined",
  "oasPathParam"
].map(fn => ({
  input: path.resolve(BASE_PATH, 'dist/rulesets/oas/functions', `${fn}.js`),
  plugins: [
    typescript({
      tsconfig: path.join(BASE_PATH, './tsconfig.rollup.json'),
      include: ['dist/**/*.{ts,tsx}'],
    }),
    resolve({
      only: ['json-schema-merge-allof', /lodash\/?.*/],
    }),
    commonjs(),
    terser(),
  ],
  output: {
    file: path.resolve(BASE_PATH, 'dist/rulesets/oas/functions', `${fn}.js`),
    format: 'cjs',
    exports: 'named'
  },
}));
