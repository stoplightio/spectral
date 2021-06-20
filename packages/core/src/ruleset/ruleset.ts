import { Rule } from './rule/rule';
import { FileRulesetSeverityDefinition, ParserOptions, RulesetDefinition } from './types';
import { assertValidRuleset } from './validation';
import { Format } from './format';
import { mergeRule } from './mergers/rules';
import { DEFAULT_PARSER_OPTIONS } from '..';

const STACK_SYMBOL = Symbol('@stoplight/spectral/ruleset/#stack');

type RulesetContext = {
  readonly severity: FileRulesetSeverityDefinition;
  readonly [STACK_SYMBOL]?: Map<RulesetDefinition, Ruleset>;
};

export class Ruleset {
  protected extends!: Ruleset[];
  public readonly formats = new Set<Format>();

  constructor(
    protected readonly definition: RulesetDefinition,
    protected readonly context: RulesetContext = { severity: 'recommended' },
  ) {
    const stack = context?.[STACK_SYMBOL] ?? new Map<RulesetDefinition, Ruleset>();

    stack.set(this.definition, this);

    if ('extends' in definition) {
      const { extends: _, ...def } = definition;
      // we don't want to validate extends - this is going to happen later on (line 29)
      assertValidRuleset({ extends: [], ...def });
    } else {
      assertValidRuleset(definition);
    }

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
            this.context.severity === 'all' || (this.context.severity === 'recommended' && rule.recommended);
        }

        if (rule.formats !== null) {
          for (const format of rule.formats) {
            this.formats.add(format);
          }
        } else if (rule.owner !== this) {
          rule.formats = new Set(rule.owner.definition.formats);
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
    const DEFAULT_RULESET_FILE = /^\.?spectral\.(ya?ml|json|m?js)$/;

    return DEFAULT_RULESET_FILE.test(uri);
  }
}
