export type RuleCategory = 'lint' | 'validation';
export type RuleSeverity = 'warn' | 'error';
export type TargetFormat = 'oas2' | 'oas3';

export interface IRuleMetadata {
  /**
   * The kebab-case name of the rule.
   */
  name: string;

  /**
   * A short, one line description of what the rule does.
   */
  description: string;

  /**
   * The formats this rule applies to
   */
  formats: TargetFormat[];

  /**
   * The type of rule
   */
  type: RuleCategory;

  /**
   * The JSON path within the format object (oas, etc) on which this rule
   * applies
   */
  objPath: string;
}

export abstract class AbstractRule {
  private enabled: boolean;
  public readonly metadata: IRuleMetadata;

  constructor(metadata: IRuleMetadata, opts: IRuleOptions) {
    this.enabled = opts.enabled;
    this.metadata = metadata;
  }

  public isEnabled() {
    return this.enabled;
  }

  public toggle() {
    this.enabled = !this.enabled;
  }

  public abstract apply(source: any): IRuleResult[];
}

export interface IRuleResult {
  /**
   * The category of the rule (ie, validation, lint)
   */
  category: RuleCategory;

  /**
   * The relevant path within the object being operated on
   */
  path: (string | number)[];

  /**
   * The rule emitting the result
   */
  name: string;

  /**
   * The rule summary for the rule generating the result
   */
  description: string;

  /**
   * The rule emitting the result
   */
  severity: RuleSeverity;

  /**
   * Message describing the error
   */
  message: string;
}

export interface IRuleConfig {
  rules: IRuleStore;
}

export interface IRuleStore {
  [formatRegex: string]: IRuleDeclaration;
}

export interface IRuleDeclaration {
  [ruleName: string]: IRuleDefinitionBase;
}

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
  severity?: boolean;
}

export * from './lintRules';
export * from './validationRules';
