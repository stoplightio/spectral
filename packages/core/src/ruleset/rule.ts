import { isString } from 'lodash';
import { DiagnosticSeverity, JsonPath, Optional } from '@stoplight/types';
import { dirname, relative } from '@stoplight/path';
import { pathToPointer } from '@stoplight/json';

import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from './utils/severity';
import { Ruleset } from './ruleset';
import { Format } from './format';
import type { HumanReadableDiagnosticSeverity, IRuleThen, RuleDefinition, Stringifable } from './types';
import { minimatch } from './utils/minimatch';
import { Formats } from './formats';
import { resolveAlias } from './alias';
import type { Stringified, FileRulesetSeverityDefinition } from './types';

export interface IRule {
  description: string | null;
  message: string | null;
  severity: DiagnosticSeverity;
  resolved: boolean;
  formats: Formats | null;
  enabled: boolean;
  recommended: boolean;
  documentationUrl: string | null;
  then: IRuleThen[];
  given: string[];
  extensions: Record<string, unknown> | null;
}

type RuleJson = Omit<IRule, 'then'> & {
  name: string;
  then: (Omit<IRuleThen, 'function'> & { function: string })[];
  owner: number;
};

export type StringifiedRule = Stringified<RuleJson>;

export class Rule implements IRule {
  public description: string | null;
  public message: string | null;
  #severity!: DiagnosticSeverity;
  public resolved: boolean;
  public formats: Formats | null;
  #enabled: boolean;
  public recommended: boolean;
  public documentationUrl: string | null;
  public extensions: Record<string, unknown> | null;
  #then!: IRuleThen[];
  #given!: string[];

  constructor(
    public readonly name: string,
    public readonly definition: RuleDefinition,
    public readonly owner: Ruleset,
  ) {
    this.recommended = definition.recommended !== false;
    this.#enabled = this.recommended;
    this.description = definition.description ?? null;
    this.message = definition.message ?? null;
    this.documentationUrl = definition.documentationUrl ?? null;
    this.severity = definition.severity;
    this.resolved = definition.resolved !== false;
    this.formats = 'formats' in definition ? new Formats(definition.formats) : null;
    this.then = definition.then;
    this.given = definition.given;
    this.extensions = definition.extensions ?? null;
  }

  public overrides?: { rulesetSource: string; definition: Map<string, Map<string, DiagnosticSeverity | -1>> };

  public get enabled(): boolean {
    return this.#enabled || this.overrides !== void 0;
  }

  public set enabled(enabled: boolean) {
    this.#enabled = enabled;
  }

  public static isEnabled(rule: IRule, severity: FileRulesetSeverityDefinition): boolean {
    return severity === 'all' || (severity === 'recommended' && rule.recommended);
  }

  public getSeverityForSource(source: string, path: JsonPath): DiagnosticSeverity | -1 {
    if (this.overrides === void 0 || this.overrides.definition.size === 0) {
      return this.severity;
    }

    const relativeSource = relative(dirname(this.overrides.rulesetSource), source);
    const relevantOverrides: Map<string, DiagnosticSeverity | -1>[] = [];

    for (const [source, override] of this.overrides.definition.entries()) {
      if (minimatch(relativeSource, source)) {
        relevantOverrides.push(override);
      }
    }

    if (relevantOverrides.length === 0) {
      return this.severity;
    }

    let severity: DiagnosticSeverity = this.severity;
    let closestPointer = '';
    const pointer = pathToPointer(path);

    for (const relevantOverride of relevantOverrides) {
      for (const [overridePath, overrideSeverity] of relevantOverride.entries()) {
        if (
          overridePath.length >= closestPointer.length &&
          (pointer === overridePath || pointer.startsWith(`${overridePath}/`))
        ) {
          closestPointer = overridePath;
          severity = overrideSeverity;
        }
      }
    }

    return severity;
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

  public get given(): string[] {
    return this.#given;
  }

  public set given(given: RuleDefinition['given']) {
    const actualGiven = Array.isArray(given) ? given : [given];
    this.#given = this.owner.hasComplexAliases
      ? actualGiven
      : actualGiven.flatMap(expr => resolveAlias(this.owner.aliases, expr, null)).filter(isString);
  }

  public getGivenForFormats(formats: Set<Format> | null): string[] {
    return this.owner.hasComplexAliases
      ? this.#given.flatMap(expr => resolveAlias(this.owner.aliases, expr, formats))
      : this.#given;
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

  public clone(): Rule {
    return new Rule(this.name, this.definition, this.owner);
  }

  public toJSON(): Stringifable<RuleJson> {
    return {
      name: this.name,
      recommended: this.recommended,
      enabled: this.enabled,
      description: this.description,
      message: this.message,
      documentationUrl: this.documentationUrl,
      severity: this.severity,
      resolved: this.resolved,
      formats: this.formats,
      then: this.then.map(then => ({
        ...then,
        function: then.function.name,
      })),
      given: Array.isArray(this.definition.given) ? this.definition.given : [this.definition.given],
      owner: this.owner.id,
      extensions: this.extensions,
    };
  }
}
