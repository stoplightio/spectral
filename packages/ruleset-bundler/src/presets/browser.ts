import { skypack } from '../plugins/skypack';
import { virtualFs } from '../plugins/virtualFs';
import type { PluginsPreset } from './types';

export const browser: PluginsPreset = io => [skypack(), virtualFs(io)];
