import { IRuleMetadata, IRule, RuleSeverity, IRuleResult, IRuleOptions } from '../../types';

export abstract class AbstractRule implements IRule {
  public static metadata: IRuleMetadata;

  protected readonly ruleSeverity: RuleSeverity;
  private enabled: boolean;

  constructor(private readonly options: IRuleOptions) {
    this.ruleSeverity = options.severity;
    this.enabled = options.enabled;
  }

  public getOptions(): IRuleOptions {
    return this.options;
  }

  public abstract apply(sourceFile: any): IRuleResult[];

  public isEnabled(): boolean {
    return this.enabled;
  }
}
