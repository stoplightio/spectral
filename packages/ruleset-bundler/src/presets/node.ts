import * as commonjs from '@rollup/plugin-commonjs';

import { url } from '../plugins/url';
import { builtins } from '../plugins/builtins';
import type { PluginsPreset } from './types';

export const node: PluginsPreset = io => [
  builtins(),
  (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
  url(io),
];
