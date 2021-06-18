import type { DocumentInventory } from '../documentInventory';
import type { Ruleset } from '../ruleset/ruleset';
import { ISpectralDiagnostic } from '../types';

export interface IRunnerInternalContext {
  ruleset: Ruleset;
  documentInventory: DocumentInventory;
  results: ISpectralDiagnostic[];
  promises: Array<Promise<void>>;
}
