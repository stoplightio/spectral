import { DiagnosticSeverity } from '@stoplight/types';
import { Format } from './format';
import { RulesetFunction, RulesetFunctionWithValidator } from '../types';
import { FormatsSet } from './utils/formatsSet';

export type HumanReadableDiagnosticSeverity = 'error' | 'warn' | 'info' | 'hint' | 'off';
export type FileRuleSeverityDefinition = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;
export type FileRulesetSeverityDefinition = 'off' | 'recommended' | 'all';

export type FileRuleDefinition = RuleDefinition | FileRuleSeverityDefinition;

export type ParserOptions = {
  duplicateKeys: DiagnosticSeverity | HumanReadableDiagnosticSeverity;
  incompatibleValues: DiagnosticSeverity | HumanReadableDiagnosticSeverity;
};

export type RuleDefinition = {
  type?: 'validation' | 'style';

  formats?: Format[];

  documentationUrl?: string;

  // A meaningful feedback about the error
  message?: string;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // The severity of results this rule generates
  severity?: DiagnosticSeverity | HumanReadableDiagnosticSeverity;

  // some rules are more important than others, recommended rules will be enabled by default
  // true by default
  recommended?: boolean;

  // Filter the target down to a subset[] with a JSON path
  given: string | string[];

  // If false, rule will operate on original (unresolved) data
  // If undefined or true, resolved data will be supplied
  resolved?: boolean;

  then: IRuleThen | IRuleThen[];
};

export interface IRuleThen {
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  // EXAMPLE: if the target object is an oas object and given = `$..responses[*]`, then `@key` would be the response code (200, 400, etc)
  field?: string;

  // name of the function to run
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: RulesetFunction<any, any> | RulesetFunctionWithValidator<any, any>;

  // Options passed to the function
  functionOptions?: unknown;
}

export type RulesetExtendsDefinition =
  | RulesetDefinition
  | (RulesetDefinition | [RulesetDefinition, FileRulesetSeverityDefinition])[];

export type RulesetOverrideDefinition = Pick<RulesetDefinition, 'formats' | 'parserOptions' | 'aliases'> &
  (
    | {
        extends: RulesetExtendsDefinition;
      }
    | {
        rules: Record<string, Readonly<FileRuleDefinition>>;
      }
    | {
        extends: RulesetExtendsDefinition;
        rules: Record<string, Readonly<FileRuleDefinition>>;
      }
  );

export type RulesetOverridesDefinition = ReadonlyArray<{ files: string[] } & RulesetOverrideDefinition>;
export type RulesetScopedAliasDefinition = {
  description?: string;
  targets: {
    formats: FormatsSet;
    given: string;
  }[];
};

export type RulesetAliasesDefinition = Record<string, string | RulesetScopedAliasDefinition>;

export type RulesetDefinition = Readonly<
  {
    documentationUrl?: string;
    description?: string;
    formats?: Format<any>[];
    parserOptions?: Partial<ParserOptions>;
    overrides?: RulesetOverridesDefinition;
    aliases?: RulesetAliasesDefinition;
  } & Readonly<
    | {
        overrides: RulesetOverridesDefinition;
      }
    | {
        extends: RulesetExtendsDefinition;
      }
    | {
        rules: Record<string, Readonly<RuleDefinition>>;
      }
    | {
        extends: RulesetExtendsDefinition;
        rules: Record<string, Readonly<FileRuleDefinition>>;
      }
  >
>;
