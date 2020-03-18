import { JsonPath } from '@stoplight/types';
import { DocumentInventory } from '../documentInventory';

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
