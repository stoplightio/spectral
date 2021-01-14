import { Optional } from '@stoplight/types';
import { JSONPathExpression } from 'nimma';

import { IDocument } from './document';
import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from './rulesets/severity';
import { IGivenNode, IProcessedRule, IThen } from './types';
import { hasIntersectingElement } from './utils';
import { DiagnosticSeverity } from '@stoplight/types';

export class Rule {
  public readonly name: string;
  public readonly description: string | null;
  public readonly message: string | null;
  public readonly severity: DiagnosticSeverity;
  public readonly resolved: boolean;
  public readonly formats: Optional<string[]>;

  public readonly then: IThen[];
  public readonly given: string[];

  public readonly enabled: boolean;

  constructor(name: string, rule: IProcessedRule) {
    this.name = name;
    this.enabled = rule.enabled ?? true;
    this.description = rule.description ?? null;
    this.message = rule.message ?? null;
    this.severity = rule.severity === void 0 ? DEFAULT_SEVERITY_LEVEL : getDiagnosticSeverity(rule.severity);
    this.resolved = rule.resolved !== false;
    this.formats = rule.formats;

    this.then = Array.isArray(rule.then) ? rule.then : [rule.then];
    this.given = Array.isArray(rule.given) ? rule.given : [rule.given];
  }

  public matchesFormat(formats: IDocument['formats']): boolean {
    if (this.formats === void 0) {
      return true;
    }

    return Array.isArray(formats) && hasIntersectingElement(this.formats, formats);
  }
}

function stub(): void {
  // nada
}

export class OptimizedRule extends Rule {
  public readonly expressions: JSONPathExpression[];

  constructor(name: string, rule: IProcessedRule) {
    super(name, rule);
    this.expressions = this.given.map(given => {
      const expr = new JSONPathExpression(given, stub, stub);
      if (expr.matches === null) {
        throw new Error(`Rule "${name}": cannot optimize ${given}`);
      }

      return expr;
    });
  }

  public hookup(cb: (rule: OptimizedRule, node: IGivenNode) => void): void {
    for (const expr of this.expressions) {
      expr.onMatch = (value, path): void => {
        cb(this, {
          path,
          value,
        });
      };
    }
  }
}
