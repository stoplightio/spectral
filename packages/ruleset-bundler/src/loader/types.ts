import type { Ruleset } from '@stoplight/spectral-core';
import type { IO } from '../types';

export type Loader = (rulesetFile: string, io: IO) => Promise<Ruleset>;
