import { DiagnosticSeverity } from '@stoplight/types';
import { AlphaRule } from '../functions/alphabetical';
import { CasingRule } from '../functions/casing';
import { LengthRule } from '../functions/length';
import { PatternRule } from '../functions/pattern';
import { SchemaRule } from '../functions/schema';
import { SchemaPathRule } from '../functions/schema-path';
import { TruthyRule } from '../functions/truthy';
import { TypedEnumRule } from '../functions/typedEnum';
import { XorRule } from '../functions/xor';
import { RuleType } from './enums';

export type Rule =
  | IRule
  | TruthyRule
  | XorRule
  | LengthRule
  | AlphaRule
  | PatternRule
  | CasingRule
  | SchemaRule
  | SchemaPathRule
  | TypedEnumRule;

export interface IRule<T = string, O = any> {
  type?: RuleType;

  formats?: string[];

  // A meaningful feedback about the error
  message?: string;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // The severity of results this rule generates
  severity?: DiagnosticSeverity | HumanReadableDiagnosticSeverity;

  // Tags attached to the rule, which can be used for organizational purposes
  tags?: string[];

  // some rules are more important than others, recommended rules will be enabled by default
  // true by default
  recommended?: boolean;

  // Filter the target down to a subset[] with a JSON path
  given: string | string[];

  // If false, rule will operate on original (unresolved) data
  // If undefined or true, resolved data will be supplied
  resolved?: boolean;

  then: IThen<T, O> | Array<IThen<T, O>>;
}

export interface IThen<T = string, O = any> {
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  // EXAMPLE: if the target object is an oas object and given = `$..responses[*]`, then `@key` would be the response code (200, 400, etc)
  field?: string;

  // name of the function to run
  function: T;

  // Options passed to the function
  functionOptions?: O;
}

export type HumanReadableDiagnosticSeverity = 'error' | 'warn' | 'info' | 'hint' | 'off';
