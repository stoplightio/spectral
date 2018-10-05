export type RuleType = 'validation' | 'style';
export type RuleSeverity = 'warn' | 'error' | 'info';

export interface IRuleDefinitionBase {
  type: RuleType;

  // The JSON path within the object this rule applies to
  path: string;

  // name of the function to run
  function: string;

  // Input to the function
  input?: any;

  // A short summary of the rule and its intended purpose
  summary: string;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // should the rule be enabled by default?
  enabled?: boolean;

  // The severity of results this rule generates
  severity?: RuleSeverity;

  // Tags attached to the rule, which can be used for organizational purposes
  tags?: string[];
}
