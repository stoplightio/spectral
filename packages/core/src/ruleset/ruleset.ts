import { dirname, relative } from '@stoplight/path';
import { isPlainObject, extractPointerFromRef, extractSourceFromRef } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import { minimatch } from './utils/minimatch';
import { Rule, StringifiedRule } from './rule';
import type {
  FileRulesetSeverityDefinition,
  ParserOptions,
  RulesetAliasesDefinition,
  RulesetDefinition,
  RulesetOverridesDefinition,
  Stringifable,
} from './types';
import { assertValidRuleset } from './validation/index';
import { mergeRule } from './mergers/rules';
import { DEFAULT_PARSER_OPTIONS, getDiagnosticSeverity } from '..';
import { mergeRulesets } from './mergers/rulesets';
import { Formats } from './formats';
import { isSimpleAliasDefinition } from './utils/guards';

const STACK_SYMBOL = Symbol('@stoplight/spectral/ruleset/#stack');
const DEFAULT_RULESET_FILE = /^\.?spectral\.(ya?ml|json|m?js)$/;

type RulesetContext = {
  readonly severity?: FileRulesetSeverityDefinition;
  readonly source?: string;
  readonly [STACK_SYMBOL]?: Map<RulesetDefinition, Ruleset>;
};

let SEED = 1;

export type StringifiedRuleset = {
  id: number;
  extends: StringifiedRuleset[] | null;
  source: string | null;
  aliases: RulesetAliasesDefinition | null;
  formats: Formats | null;
  rules: Record<string, StringifiedRule>;
  overrides: RulesetOverridesDefinition | null;
  parserOptions: ParserOptions;
};

export class Ruleset {
  public readonly id = SEED++;

  protected readonly extends: Ruleset[] | null;
  public readonly formats = new Formats();
  public readonly overrides: RulesetOverridesDefinition | null;
  public readonly aliases: RulesetAliasesDefinition | null;
  public readonly hasComplexAliases: boolean;
  public readonly rules: Record<string, Rule>;
  public readonly definition: RulesetDefinition;

  readonly #context: RulesetContext & { severity: FileRulesetSeverityDefinition };

  constructor(readonly maybeDefinition: unknown, context?: RulesetContext) {
    let definition: RulesetDefinition;
    if (isPlainObject(maybeDefinition) && 'extends' in maybeDefinition) {
      const { extends: _, ...def } = maybeDefinition;
      // we don't want to validate extends - this is going to happen later on (line 29)
      assertValidRuleset({ extends: [], ...def });
      definition = maybeDefinition as RulesetDefinition;
    } else {
      assertValidRuleset(maybeDefinition);
      definition = maybeDefinition;
    }

    this.definition = definition;

    this.#context = {
      severity: 'recommended',
      ...context,
    };

    let hasComplexAliases = false;
    this.aliases =
      definition.aliases === void 0
        ? null
        : Object.fromEntries(
            Object.entries(definition.aliases).map(alias => {
              const [name, value] = alias;

              if (isSimpleAliasDefinition(value)) {
                return alias;
              }

              hasComplexAliases = true;

              const targets = value.targets.map(target => ({
                formats: new Formats(target.formats),
                given: target.given,
              }));

              return [name, { ...value, targets }];
            }),
          );

    this.hasComplexAliases = hasComplexAliases;

    const stack = context?.[STACK_SYMBOL] ?? new Map<RulesetDefinition, Ruleset>();

    stack.set(this.definition, this);

    this.extends =
      'extends' in definition
        ? (Array.isArray(definition.extends) ? definition.extends : [definition.extends]).reduce<Ruleset[]>(
            (extensions, extension) => {
              let actualExtension;
              let severity: FileRulesetSeverityDefinition = 'recommended';

              if (Array.isArray(extension)) {
                [actualExtension, severity] = extension;
              } else {
                actualExtension = extension;
              }

              const existingInstance = stack.get(actualExtension);

              if (existingInstance !== void 0) {
                return extensions;
              }

              extensions.push(new Ruleset(actualExtension, { severity, [STACK_SYMBOL]: stack }));
              return extensions;
            },
            [],
          )
        : null;

    if (stack.size === 1 && definition.overrides) {
      this.overrides = definition.overrides;
    } else {
      this.overrides = null;
    }

    stack.delete(this.definition);

    if (Array.isArray(this.definition.formats)) {
      for (const format of this.definition.formats) {
        this.formats.add(format);
      }
    }

    if (Array.isArray(this.extends)) {
      for (const { formats } of this.extends) {
        for (const format of formats) {
          this.formats.add(format);
        }
      }
    }

    this.rules = this.#getRules();
  }

  get source(): string | null {
    return this.#context.source ?? null;
  }

  public fromSource(source: string | null): Ruleset {
    if (this.overrides === null) {
      return this;
    }

    const { source: rulesetSource } = this;

    if (source === null) {
      throw new Error(
        'Document must have some source assigned. If you use Spectral programmatically make sure to pass the source to Document',
      );
    }

    if (rulesetSource === null) {
      throw new Error(
        'Ruleset must have some source assigned. If you use Spectral programmatically make sure to pass the source to Ruleset',
      );
    }

    const relativeSource = relative(dirname(rulesetSource), source);
    const pointerOverrides: Record<
      string, // ruleName
      {
        rulesetSource: string;
        definition: Map<string, Map<string, DiagnosticSeverity | -1>>; // Map<Source, Map<Pointer, Severity>>>
      }
    > = {};

    const overrides = this.overrides.flatMap(({ files, ...ruleset }) => {
      const filteredFiles: string[] = [];

      for (const pattern of files) {
        const actualPattern = extractSourceFromRef(pattern) ?? pattern;

        if (!minimatch(relativeSource, actualPattern)) continue;

        const pointer = extractPointerFromRef(pattern);

        if (actualPattern === pattern) {
          filteredFiles.push(pattern);
        } else if (!('rules' in ruleset) || pointer === null) {
          throw new Error('Unknown error. The ruleset is presumably invalid.');
        } else {
          for (const [ruleName, rule] of Object.entries(ruleset.rules)) {
            if (typeof rule === 'object' || typeof rule === 'boolean') {
              throw new Error('Unknown error. The ruleset is presumably invalid.');
            }

            const { definition: rulePointerOverrides } = (pointerOverrides[ruleName] ??= {
              rulesetSource,
              definition: new Map(),
            });

            const severity = getDiagnosticSeverity(rule);
            let sourceRulePointerOverrides = rulePointerOverrides.get(actualPattern);

            if (sourceRulePointerOverrides === void 0) {
              sourceRulePointerOverrides = new Map();
              rulePointerOverrides.set(actualPattern, sourceRulePointerOverrides);
            }

            sourceRulePointerOverrides.set(pointer, severity);
          }
        }
      }

      return filteredFiles.length === 0 ? [] : ruleset;
    });

    const { overrides: _, ...definition } = this.definition;

    if (overrides.length === 0 && Object.keys(pointerOverrides).length === 0) {
      return this;
    }

    const mergedOverrides =
      overrides.length === 0
        ? null
        : overrides.length > 1
        ? overrides
            .slice(1)
            .reduce<RulesetDefinition>(
              (left, right) => mergeRulesets(left, right, true),
              overrides[0] as RulesetDefinition,
            )
        : overrides[0];

    const ruleset = new Ruleset(
      mergedOverrides === null ? (definition as RulesetDefinition) : mergeRulesets(definition, mergedOverrides, false),
      {
        severity: 'recommended',
        source: rulesetSource,
      },
    );

    for (const [ruleName, rulePointerOverrides] of Object.entries(pointerOverrides)) {
      if (ruleName in ruleset.rules) {
        ruleset.rules[ruleName].overrides = rulePointerOverrides;
      }
    }

    return ruleset;
  }

  #getRules(): Record<string, Rule> {
    const rules: Record<string, Rule> = {};

    if (this.extends !== null && this.extends.length > 0) {
      for (const extendedRuleset of this.extends) {
        if (extendedRuleset === this) continue;
        for (const rule of Object.values(extendedRuleset.rules)) {
          rules[rule.name] = rule;
        }
      }
    }

    if ('rules' in this.definition) {
      for (const [name, definition] of Object.entries(this.definition.rules)) {
        const rule = mergeRule(rules[name], name, definition, this);
        rules[name] = rule;

        if (rule.owner === this) {
          rule.enabled =
            this.#context.severity === 'all' || (this.#context.severity === 'recommended' && rule.recommended);
        }

        if (rule.formats !== null) {
          for (const format of rule.formats) {
            this.formats.add(format);
          }
        } else if (rule.owner !== this) {
          rule.formats = rule.owner.definition.formats === void 0 ? null : new Formats(rule.owner.definition.formats);
        } else if (this.definition.formats !== void 0) {
          rule.formats = new Formats(this.definition.formats);
        }

        if (this.definition.documentationUrl !== void 0 && rule.documentationUrl === null) {
          rule.documentationUrl = `${this.definition.documentationUrl}#${name}`;
        }
      }
    }

    return rules;
  }

  public get parserOptions(): ParserOptions {
    return { ...DEFAULT_PARSER_OPTIONS, ...this.definition.parserOptions };
  }

  public static isDefaultRulesetFile(uri: string): boolean {
    return DEFAULT_RULESET_FILE.test(uri);
  }

  public toJSON(): Stringifable<StringifiedRuleset> {
    return {
      id: this.id,
      extends: this.extends,
      source: this.source,
      aliases: this.aliases,
      formats: this.formats.size === 0 ? null : this.formats,
      rules: this.rules,
      overrides: this.overrides,
      parserOptions: this.parserOptions,
    };
  }
}
