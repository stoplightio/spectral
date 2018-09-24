export type RuleType = 'lint' | 'validation';
export type RuleSeverity = 'warn' | 'error';
export type TargetFormat = 'oas2' | 'oas3';

export interface IRuleOptions {
  enabled: boolean;
  severity: RuleSeverity;
}

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
  type: RuleType;

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
   * The type of rule that generated the result
   */
  type: RuleType;

  /**
   * The relevant path within the object being operated on
   */
  path: (string | number)[];

  /**
   * The rule emitting the result
   */
  ruleName: string;

  /**
   * The rule emitting the result
   */
  severity: RuleSeverity;

  /**
   * One-line message describing the error
   */
  message: string;

  /**
   * Detailed message regarding the result
   */
  details?: string;
}
