import { RuleCollection } from './spectral';

export interface IRuleset {
  rules: RuleCollection;
}

export interface IRulesetFile {
  extends?: string[];
  rules: RuleCollection;
}
