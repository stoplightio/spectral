export type RuleSeverity = 'warn' | 'error' | 'info';

export interface IRuleDefinitionBase {
  /**
   * The high-level purpose of the rule (typically 'style' or 'validation')
   */
  category: string;

  /**
   * The type of rule this is (ie, schema, function, truthy)
   */
  type: string;

  /**
   * The JSON path within the object this rule applies to
   */
  path: string;

  /**
   * A short summary of the rule and its intended purpose
   */
  summary: string;

  /**
   * A long-form description of the rule formatted in markdown
   */
  description: string;

  /**
   * Whether the rule should be enabled by default
   */
  enabled: boolean;

  /**
   * The severity of results this rule generates
   */
  severity?: RuleSeverity;

  /**
   * Tags attached to the rule, which can be used for organizational purposes
   */
  tags?: string[];
}
