import { Linter } from './lint';
import { Validator } from './validation';
import { IRuleResult, RuleSeverity } from './types';

export class Spectral {
  private linter: Linter;
  private validator: Validator;

  constructor() {
    this.linter = new Linter();
    this.validator = new Validator();
  }

  public apply(data: object, format: string): IRuleResult[] {
    const results = [];

    results.push(...this.linter.lint(data, format));
    results.push(...this.validator.validate(data, format));

    return results;
  }
}
