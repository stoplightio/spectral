import { JsonPath } from '@stoplight/types';

export type IFunction<O = any> = (
  targetValue: any,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues
) => void | IFunctionResult[];

export interface IFunctionPaths {
  given: JsonPath;
  target?: JsonPath;
}

export interface IFunctionValues {
  original: any;
  given: any;
  resolved?: any;
}

export interface IFunctionResult {
  message: string;
  path?: JsonPath;
}
