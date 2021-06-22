import { Optional } from '@stoplight/types';
import { JSONPathExpression } from 'nimma';

import { DiagnosticSeverity } from '@stoplight/types';
import { getDiagnosticSeverity, DEFAULT_SEVERITY_LEVEL } from '../utils/severity';
import { IGivenNode } from '../../types';
import { Ruleset } from '../ruleset';
import { Format } from '../format';
import { HumanReadableDiagnosticSeverity, IRuleThen, RuleDefinition } from '../types';

export interface IRule {
  description: string | null;
  message: string | null;
  severity: DiagnosticSeverity;
  resolved: boolean;
  formats: Set<Format> | null;
  enabled: boolean;
  recommended: boolean;
  documentationUrl: string | null;
  then: IRuleThen[];
  given: string[];
}

export class Rule implements IRule {
  public description: string | null;
  public message: string | null;
  #severity!: DiagnosticSeverity;
  public resolved: boolean;
  public formats: Set<Format> | null;
  public enabled: boolean;
  public recommended: boolean;
  public documentationUrl: string | null;
  #then!: IRuleThen[];
  public given: string[];

  public expressions?: JSONPathExpression[] | null;

  public get isOptimized(): boolean {
    return Array.isArray(this.expressions);
  }

  constructor(
    public readonly name: string,
    public readonly definition: RuleDefinition,
    public readonly owner: Ruleset,
  ) {
    this.recommended = definition.recommended !== false;
    this.enabled = this.recommended;
    this.description = definition.description ?? null;
    this.message = definition.message ?? null;
    this.documentationUrl = definition.documentationUrl ?? null;
    this.severity = definition.severity;
    this.resolved = definition.resolved !== false;
    this.formats = 'formats' in definition ? new Set(definition.formats) : null;

    this.then = definition.then;

    this.given = Array.isArray(definition.given) ? definition.given : [definition.given];
  }

  public get severity(): DiagnosticSeverity {
    return this.#severity;
  }

  public set severity(severity: Optional<HumanReadableDiagnosticSeverity | DiagnosticSeverity>) {
    if (severity === void 0) {
      this.#severity = DEFAULT_SEVERITY_LEVEL;
    } else {
      this.#severity = getDiagnosticSeverity(severity);
    }
  }

  public get then(): IRuleThen[] {
    return this.#then;
  }

  public set then(then: RuleDefinition['then']) {
    this.#then = Array.isArray(then) ? then : [then];
  }

  public matchesFormat(formats: Set<Format> | null): boolean {
    if (this.formats === null) {
      return true;
    }

    if (formats === null) {
      return false;
    }

    for (const format of formats) {
      if (this.formats.has(format)) {
        return true;
      }
    }

    return false;
  }

  public optimize(): boolean {
    if (this.expressions !== void 0) return this.isOptimized;

    try {
      this.expressions = this.given.map(given => {
        const expr = new JSONPathExpression(given, stub, stub);
        if (expr.matches === null) {
          throw new Error(`Rule "${this.name}": cannot optimize ${given}`);
        }

        return expr;
      });
    } catch {
      this.expressions = null;
    }

    return this.isOptimized;
  }

  public clone(): Rule {
    return new Rule(this.name, this.definition, this.owner);
  }

  public hookup(cb: (rule: Rule, node: IGivenNode) => void): void {
    for (const expr of this.expressions!) {
      expr.onMatch = (value, path): void => {
        cb(this, {
          path,
          value,
        });
      };
    }
  }
}

function stub(): void {
  // nada
}
