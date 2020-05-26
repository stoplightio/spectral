import { DocumentInventory } from '../documentInventory';
import { FunctionCollection, IRuleResult, RunRuleCollection } from '../types';
import { RulesetExceptionCollection } from '../types/ruleset';

export interface IRunnerPublicContext {
  rules: RunRuleCollection;
  functions: FunctionCollection;
  exceptions: RulesetExceptionCollection;
}

export interface IRunnerInternalContext extends IRunnerPublicContext {
  documentInventory: DocumentInventory;
  results: IRuleResult[];
  promises: Array<Promise<void>>;
}
