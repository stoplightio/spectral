import { JsonPath } from '@stoplight/types';
import { DocumentInventory } from '../documentInventory';
import { CoreFunctions } from '../functions';

export interface IFunctionContext {
  functions: CoreFunctions;
}

export type IFunction<O = any> = (
  targetValue: any,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[];

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
