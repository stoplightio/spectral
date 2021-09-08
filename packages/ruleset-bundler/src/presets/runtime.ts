import { skypack } from '../plugins/skypack';
import { virtualFs } from '../plugins/virtualFs';
import { url } from '../plugins/url';
import { builtins } from '../plugins/builtins';
import type { PluginsPreset } from './types';

export const runtime: PluginsPreset = io => [builtins(), skypack(), url(io), virtualFs(io)];
