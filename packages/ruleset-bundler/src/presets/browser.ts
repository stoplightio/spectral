import { esmCdn } from '../plugins/skypack';
import { virtualFs } from '../plugins/virtualFs';
import type { PluginsPreset } from './types';

export const browser: PluginsPreset = io => [esmCdn(), virtualFs(io)];
