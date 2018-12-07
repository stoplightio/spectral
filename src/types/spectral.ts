import { ObjPath } from '@stoplight/types/parsers';
import { IValidationResult } from '@stoplight/types/validations';
import { IRuleFunction, Rule, RuleType } from '.';

export interface IFunctionCollection {
  [name: string]: IRuleFunction;
}

export interface IRuleCollection {
  [index: string]: IRuleEntry;
}

export interface IRuleEntry {
  name: string;
  format: string;
  rule: Rule;
  apply: IRuleFunction;
}

export interface IRunOpts {
  /**
   * The fully-resolved version of the target object.
   *
   * Some functions require this in order to operate.
   */
  resolvedTarget?: object;

  /**
   * Optional rule type, when supplied only rules of this type are run
   */
  type?: RuleType;

  /**
   * The specification to apply to the target
   */
  format: string;
}

export type IFunction<O = any> = (
  targetValue: any,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues
) => void | IFunctionResult[];

export interface IFunctionPaths {
  given: ObjPath;
  target: ObjPath;
}

export interface IFunctionValues {
  original: any;
  resolved?: any;
  given: any;
}

export interface IFunctionResult {
  message: string;
  path?: ObjPath;
}

export interface IRuleResult extends IValidationResult {
  type: RuleType;
}

export interface IRunResult {
  results: IRuleResult[];
}
