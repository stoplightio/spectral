export type RuleSeverity = 'warn' | 'error' | 'info';

export interface IRuleDefinitionBase {
  /**
   * The type of rule this is (ie, style, validation)
   */
  type: string;

  /**
   * The rule function
   */
  function: string;

  /**
   * The JSON path within the object this rule applies to
   */
  path: string;

  /**
   * A short summary of the rule and its intended purpose
   */
  summary: string;

  /**
   * An optional long-form description of the rule formatted in markdown
   */
  description?: string;

  /**
   * Whether the rule should be enabled by default
   */
  enabled: boolean;

  /**
   * Input to the rule function
   */
  input: any;

  /**
   * The severity of results this rule generates
   */
  severity?: RuleSeverity;

  /**
   * Tags attached to the rule, which can be used for organizational purposes
   */
  tags?: string[];
}
