export type RuleCategory = 'lint' | 'validation';
export type RuleSeverity = 'warn' | 'error';

export interface IRuleDefinitionBase {
  /**
   * The category this rule belongs to (ie, lint, validation)
   */
  category: RuleCategory;

  /**
   * The type of rule this is (ie, schema, function, truthy)
   */
  type: string;

  /**
   * The JSON path within the object this rule applies to
   */
  path: string;

  /**
   * A description of this rule
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
}

export interface IRuleBase extends IRuleDefinitionBase {
  name: string;
}
