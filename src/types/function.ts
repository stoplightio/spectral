import { JsonPath } from '@stoplight/types';
import { DocumentInventory } from '../documentInventory';
import { CoreFunctions } from '../functions';
import { Rule } from '../rule';

export interface IFunctionContext {
  functions: CoreFunctions;
  cache: Map<unknown, unknown>;
}

export type IFunction<O extends object | null = null> = (
  targetValue: unknown,
  options: O extends null ? null : O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[] | Promise<void | IFunctionResult[]>;

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
