import { url } from '../plugins/url';
import { builtins } from '../plugins/builtins';
import type { PluginsPreset } from './types';

export const node: PluginsPreset = io => [builtins(), url(io)];
