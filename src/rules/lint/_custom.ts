import { IFunctionRule, RawResult } from '../../types';
import * as Rules from '../custom';

export const functionRule = (r: IFunctionRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    if (typeof r.function !== 'string') {
      console.warn(`Custom Rule Warning: value for key "function" needs to be of type string`);
      return [];
    }

    const func: (object: object, args?: any) => RawResult[] = Rules[r.function];

    if (!func) {
      console.warn(`Custom Rule Warning: rule ${r.function} is not defined`);
      return [];
    }

    if (typeof func !== 'function') {
      console.warn(`Custom Rule Warning: rule ${r.function} is not a function`);
      return [];
    }

    return func(object, r.args); // each custom rule should return RawResult[], use spread operator if not string? but what if you want it to stay as an array?
  };
};
