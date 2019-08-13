import { Resolved } from './resolved';
import { IRuleResult, IRunRule } from './types';
export declare const runRules: (resolved: Resolved, rules: import("@stoplight/types").Dictionary<IRunRule, string>, functions: import("@stoplight/types").Dictionary<import("./types").IFunction<any>, string>) => IRuleResult[];
