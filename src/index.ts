import { IRuleResult, IRuleConfig } from 'spectral/types';
import { RuleManager } from 'spectral/rules';

export class Spectral {
  private ruleManager: RuleManager;

  constructor(rulesConfig: IRuleConfig) {
    // register the default set of rules
    this.ruleManager = new RuleManager(rulesConfig);
  }

  public getRules(format?: string);

  public getRule(name: string);

  public apply(data: object, format: string, rulesConfig?: IRuleConfig): IRuleResult[] {
    const results = [];

    results.push(...this.linter.lint(data, format));
    results.push(...this.validator.validate(data, format));

    return results;
  }
}

// const s = new Spectral(config);
// const results = s.apply(data, 'oas2');
// const results = s.apply(data, 'oas2', rulesConfig);
