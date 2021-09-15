import type { IO } from '../types';
import type { Plugin } from 'rollup';

export type PluginsPreset = (io: IO) => Plugin[];
