import { JsonPath } from '@stoplight/types';
import { DocumentInventory } from '../documentInventory';
import { Rule } from '../rule';

export type RulesetFunction<I extends unknown = unknown, O extends unknown = unknown> = (
  input: I,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[] | Promise<void | IFunctionResult[]>;

export type IFunction = RulesetFunction;

export type RulesetFunctionWithValidator<I extends unknown = unknown, O extends unknown = unknown> = RulesetFunction<
  I,
  O
> & {
  validator<O = unknown>(options: unknown): asserts options is O;
};

export interface IFunctionPaths {
  given: JsonPath;
  target?: JsonPath;
}

export interface IFunctionValues {
  original: unknown;
  given: unknown;
  documentInventory: DocumentInventory;
  rule: Rule;
}

export interface IFunctionResult {
  message: string;
  path?: JsonPath;
}
