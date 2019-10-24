import { JsonPath } from '@stoplight/types';
import { Resolved } from '../resolved';

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
  resolved: Resolved;
}

export interface IFunctionResult {
  message: string;
  path?: JsonPath;
}
