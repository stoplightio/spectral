import { url } from '../plugins/url';
import type { PluginsPreset } from './types';

export const node: PluginsPreset = io => [url(io)];
