import { DocumentInventory } from '../documentInventory';
import { FunctionCollection, IRuleResult, RunRuleCollection } from '../types';

export interface IRunnerPublicContext {
  rules: RunRuleCollection;
  functions: FunctionCollection;
}

export interface IRunnerInternalContext extends IRunnerPublicContext {
  documentInventory: DocumentInventory;
  results: IRuleResult[];
  promises: Array<Promise<void>>;
}
