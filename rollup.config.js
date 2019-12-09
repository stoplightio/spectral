import typescript from 'rollup-plugin-typescript2';
import * as path from 'path';
import * as fs from 'fs';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const BASE_PATH = process.cwd();
const directory = 'dist/rulesets/oas/functions';
const targetDir = path.join(BASE_PATH, directory);

const functions = [];
for (const file of fs.readdirSync(targetDir)) {
  const targetFile = path.join(targetDir, file);
  const stat = fs.statSync(targetFile);
  if (!stat.isFile()) continue;
  const ext = path.extname(targetFile);
  if (ext !== '.js') continue;

  functions.push(targetFile);
}

module.exports = functions.map(fn => ({
  input: fn,
  plugins: [
    typescript({
      tsconfig: path.join(BASE_PATH, './tsconfig.rollup.json'),
      include: ['dist/**/*.{ts,tsx}'],
    }),
    resolve(),
    commonjs({
      namedExports: {
        'node_modules/lodash/lodash.js': ['isObject', 'trimStart'],
        'node_modules/@stoplight/types/dist/index.js': ['DiagnosticSeverity'],
      },
    }),
    terser(),
  ],
  output: {
    file: fn,
    format: 'cjs',
    exports: 'named'
  },
}));
