import { IFunction, IFunctionResult } from '../types';
import { printValue } from '../utils/printValue';
import { isJsonPrimitive } from '../guards/isJsonPrimitive';

export interface IEnumRuleOptions {
  values: (string | number | null | boolean)[];
}

export const enumeration: IFunction<IEnumRuleOptions> = (targetVal, opts) => {
  if (!isJsonPrimitive(targetVal)) {
    return [
      {
        message: '#{{print("property")}}must be primitive',
      },
    ];
  }

  const { values } = opts;
  const results: IFunctionResult[] = [];

  if (!values.includes(targetVal)) {
    results.push({
      message: `#{{print("value")}} must be equal to one of the allowed values: ${values.map(printValue).join(', ')}`,
    });
  }

  return results;
};
