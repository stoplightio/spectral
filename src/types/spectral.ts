import { IRuleFunction, IRuleset, Rule, RuleType } from '.';

export interface IFunctionStore {
  [name: string]: IRuleFunction;
}

export interface IRuleStore {
  [index: string]: IRuleEntry;
}

export interface IRuleEntry {
  name: string;
  format: string;
  rule: Rule;
  apply: IRuleFunction;
}

export interface IParsedRulesetResult {
  rulesets: IRuleset[];
  functionStore: IFunctionStore;
  ruleStore: IRuleStore;
}

export interface ISpectralOpts {
  rulesets: IRuleset[];
}

export interface IRunOpts {
  /**
   * The un-resolved object being parsed
   */
  target: object;

  /**
   * The fully-resolved object being parsed
   */
  resTarget?: object;

  /**
   * A stringified version of the target
   */
  strTarget?: string;

  /**
   * The specification to apply to the target
   */
  spec: string;

  /**
   * Optional ruleset to apply to the target. If not provided, the initialized ruleset will be used
   * instead.
   */
  rulesets?: IRuleset[];

  /**
   * Optional rule type, when supplied only rules of this type are run
   */
  type?: RuleType;
}
