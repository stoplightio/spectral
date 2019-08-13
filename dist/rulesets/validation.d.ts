import { FileRule, IRulesetFile } from '../types/ruleset';
import { Rule } from '../types';
export declare function assertValidRuleset(ruleset: unknown): IRulesetFile;
export declare function isValidRule(rule: FileRule): rule is Rule;
