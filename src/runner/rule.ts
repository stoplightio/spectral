import { IDocument } from '../document';
import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from '../rulesets/severity';
import { IRule, IThen, SpectralDiagnosticSeverity } from '../types';
import { hasIntersectingElement } from '../utils';
import { CompiledExpression } from './compile';
import { TraverseCache } from './traverse';

export class Rule {
  public readonly name: string;
  public readonly description: string | null;
  public readonly message: string | null;
  public readonly severity: SpectralDiagnosticSeverity;
  public readonly resolved: boolean;

  public readonly then: IThen[];
  public readonly given: string[];

  public get enabled() {
    return this.severity !== -1;
  }

  constructor(name: string, protected rule: IRule) {
    this.name = name;
    this.description = rule.description ?? null;
    this.message = rule.message ?? null;
    this.severity = rule.severity === void 0 ? DEFAULT_SEVERITY_LEVEL : getDiagnosticSeverity(rule.severity);
    this.resolved = rule.resolved !== false;

    this.then = Array.isArray(rule.then) ? rule.then : [rule.then];
    this.given = Array.isArray(rule.given) ? rule.given : [rule.given];
  }

  public matchesFormat(formats: IDocument['formats']) {
    if (this.rule.formats === void 0) {
      return true;
    }

    return Array.isArray(formats) && hasIntersectingElement(this.rule.formats, formats);
  }
}

export class OptimizedRule extends Rule {
  public completed = false;

  constructor(name: string, rule: IRule, protected compiledExpressions: CompiledExpression[]) {
    super(name, rule);
  }

  protected static matchesPath(path: string, pattern: RegExp, cache: TraverseCache) {
    const cachedValue = cache.get(pattern);
    if (cachedValue !== void 0) {
      return cachedValue;
    }

    const match = pattern.test(path);
    cache.set(pattern, match);
    return match;
  }

  public matchesPath(path: string, cache: TraverseCache): boolean {
    if (this.completed) return false;

    for (const expression of this.compiledExpressions) {
      const matched = OptimizedRule.matchesPath(path, expression.value, cache);
      if (matched) {
        if (expression.singleMatch) {
          // this.completed = true;
        }

        return true;
      }
    }

    return false;
  }
}
