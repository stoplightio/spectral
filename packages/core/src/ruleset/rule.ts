import { isString } from 'lodash';
import { DiagnosticSeverity, JsonPath, Optional } from '@stoplight/types';
import { dirname, relative } from '@stoplight/path';
import { pathToPointer } from '@stoplight/json';
import { printValue } from '@stoplight/spectral-runtime';

import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from './utils/severity';
import { Ruleset } from './ruleset';
import { Format } from './format';
import type {
  HumanReadableDiagnosticSeverity,
  IRuleThen,
  RuleDefinition,
  RulesetAliasesDefinition,
  RulesetScopedAliasDefinition,
  Stringifable,
} from './types';
import { minimatch } from './utils/minimatch';
import { Formats } from './formats';
import { isSimpleAliasDefinition } from './utils/guards';

const ALIAS = /^#([A-Za-z0-9_-]+)/;

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
}

export type StringifiedRule = Omit<IRule, 'formats' | 'then'> & {
  name: string;
  formats: string[] | null;
  then: (Pick<IRuleThen, 'field'> & { function: string; functionOptions?: string })[];
  owner: number;
};

export class Rule implements IRule {
  public description: string | null;
  public message: string | null;
  #severity!: DiagnosticSeverity;
  public resolved: boolean;
  public formats: Formats | null;
  #enabled: boolean;
  public recommended: boolean;
  public documentationUrl: string | null;
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
  }

  public overrides?: { rulesetSource: string; definition: Map<string, Map<string, DiagnosticSeverity | -1>> };

  public get enabled(): boolean {
    return this.#enabled || this.overrides !== void 0;
  }

  public set enabled(enabled: boolean) {
    this.#enabled = enabled;
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
        if (overridePath.length >= closestPointer.length && pointer.startsWith(overridePath)) {
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
      : actualGiven.flatMap(expr => Rule.#resolveAlias(this.owner.aliases, expr, null, new Set())).filter(isString);
  }

  public getGivenForFormats(formats: Set<Format> | null): string[] {
    return this.owner.hasComplexAliases
      ? this.#given.flatMap(expr => Rule.#resolveAlias(this.owner.aliases, expr, formats, new Set()))
      : this.#given;
  }

  static #resolveAlias(
    aliases: RulesetAliasesDefinition | null,
    expr: string,
    formats: Set<Format> | null,
    stack: Set<string>,
  ): string[] {
    const resolvedExpressions: string[] = [];

    if (expr.startsWith('#')) {
      const alias = ALIAS.exec(expr)?.[1];

      if (alias === void 0 || alias === null) {
        throw new ReferenceError(`"${this.name}" rule references an invalid alias`);
      }

      if (stack.has(alias)) {
        const _stack = [...stack, alias];
        throw new ReferenceError(`Alias "${_stack[0]}" is circular. Resolution stack: ${_stack.join(' -> ')}`);
      }

      stack.add(alias);

      if (aliases === null || !(alias in aliases)) {
        throw new ReferenceError(`Alias "${alias}" does not exist`);
      }

      const aliasValue = aliases[alias];
      let actualAliasValue: string[] | null;
      if (isSimpleAliasDefinition(aliasValue)) {
        actualAliasValue = aliasValue;
      } else {
        actualAliasValue = Rule.#resolveAliasForFormats(aliasValue, formats);
      }

      if (actualAliasValue !== null) {
        resolvedExpressions.push(
          ...actualAliasValue.flatMap(item =>
            Rule.#resolveAlias(aliases, item + expr.slice(alias.length + 1), formats, new Set([...stack])),
          ),
        );
      }
    } else {
      resolvedExpressions.push(expr);
    }

    return resolvedExpressions;
  }

  static #resolveAliasForFormats(
    { targets }: RulesetScopedAliasDefinition,
    formats: Set<Format> | null,
  ): string[] | null {
    if (formats === null || formats.size === 0) {
      return null;
    }

    // we start from the end to be consistent with overrides etc. - we generally tend to pick the "last" value.
    for (let i = targets.length - 1; i >= 0; i--) {
      const target = targets[i];
      for (const format of target.formats) {
        if (formats.has(format)) {
          return target.given;
        }
      }
    }

    return null;
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

  public toJSON(): Stringifable<StringifiedRule> {
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
        ...then.function,
        function: then.function.name,
        ...('functionOptions' in then ? { functionOptions: printValue(then.functionOptions) } : null),
      })),
      given: Array.isArray(this.definition.given) ? this.definition.given : [this.definition.given],
      owner: this.owner.id,
    };
  }
}
