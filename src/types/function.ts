import { JsonPath } from '@stoplight/types';
import { DocumentInventory } from '../documentInventory';
import { CoreFunctions } from '../functions';

export interface IFunctionContext {
  functions: CoreFunctions;
  cache: Map<unknown, unknown>;
}

export type IFunction<O extends object | undefined = undefined> = (
  targetValue: any,
  options: O extends undefined ? undefined : O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[] | Promise<void | IFunctionResult[]>;

export interface IFunctionPaths {
  given: JsonPath;
  target?: JsonPath;
}

export interface IFunctionValues {
  original: any;
  given: any;
  documentInventory: DocumentInventory;
}

export interface IFunctionResult {
  message: string;
  path?: JsonPath;
}
