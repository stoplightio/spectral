import { dirname, relative } from '@stoplight/path';
import * as minimatch from 'minimatch';
import { Rule } from './rule/rule';
import {
  FileRulesetSeverityDefinition,
  ParserOptions,
  RulesetAliasesDefinition,
  RulesetDefinition,
  RulesetOverridesDefinition,
} from './types';
import { assertValidRuleset } from './validation';
import { Format } from './format';
import { mergeRule } from './mergers/rules';
import { DEFAULT_PARSER_OPTIONS } from '..';
import { mergeRulesets } from './mergers/rulesets';
import { isPlainObject } from '@stoplight/json';

const STACK_SYMBOL = Symbol('@stoplight/spectral/ruleset/#stack');
const DEFAULT_RULESET_FILE = /^\.?spectral\.(ya?ml|json|m?js)$/;

type RulesetContext = {
  readonly severity?: FileRulesetSeverityDefinition;
  readonly source?: string;
  readonly [STACK_SYMBOL]?: Map<RulesetDefinition, Ruleset>;
};

export class Ruleset {
  protected extends!: Ruleset[];
  public readonly formats = new Set<Format>();
  public readonly overrides: RulesetOverridesDefinition | null;
  public readonly aliases: RulesetAliasesDefinition | null;
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

    this.aliases = definition.aliases === void 0 ? null : { ...definition.aliases };

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
        : [];

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

    for (const { formats } of this.extends) {
      for (const format of formats) {
        this.formats.add(format);
      }
    }

    this.rules;
  }

  get source(): string | null {
    return this.#context.source ?? null;
  }

  public fromSource(source: string | null): Ruleset {
    if (this.overrides === null) {
      return this;
    }

    if (source === null) {
      throw new Error(
        'Document must have some source assigned. If you use Spectral programmatically make sure to pass the source to Document',
      );
    }

    if (this.source === null) {
      throw new Error(
        'Ruleset must have some source assigned. If you use Spectral programmatically make sure to pass the source to Ruleset',
      );
    }

    const relativeSource = relative(dirname(this.source), source);
    const minimatchOpts = { matchBase: true };
    const overrides = this.overrides
      .filter(({ files }) => files.some(pattern => minimatch(relativeSource, pattern, minimatchOpts)))
      .map(({ files, ...ruleset }) => ruleset);

    const { overrides: _, ...definition } = this.definition;

    if (overrides.length === 0) {
      return this;
    }

    const mergedOverrides =
      overrides.length > 1
        ? overrides
            .slice(1)
            .reduce<RulesetDefinition>(
              (left, right) => mergeRulesets(left, right, true),
              overrides[0] as RulesetDefinition,
            )
        : overrides[0];

    return new Ruleset(mergeRulesets(definition, mergedOverrides, false), {
      severity: 'recommended',
      source: this.source,
    });
  }

  public get rules(): Record<string, Rule> {
    const rules: Record<string, Rule> = {};

    if (this.extends.length > 0) {
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
          rule.formats = rule.owner.definition.formats === void 0 ? null : new Set(rule.owner.definition.formats);
        } else if (this.definition.formats !== void 0) {
          rule.formats = new Set(this.definition.formats);
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
}
