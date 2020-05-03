import { DocumentInventory } from '../documentInventory';
import { FunctionCollection, IRuleResult, RunRuleCollection } from '../types';
import { RulesetExceptionCollection } from '../types/ruleset';

export interface IRunnerPublicContext {
  documentInventory: DocumentInventory;
  rules: RunRuleCollection;
  functions: FunctionCollection;
  exceptions: RulesetExceptionCollection;
}

export interface IRunnerInternalContext extends IRunnerPublicContext {
  results: IRuleResult[];
  promises: Array<Promise<void>>;
}
