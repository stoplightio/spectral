import type { IFunction, IFunctionContext, IFunctionResult } from '../../../types';
import { isObject } from 'lodash';

export const oasUnusedComponent: IFunction<{}> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  _paths,
  otherValues,
) {
  const results: IFunctionResult[] = [];

  if (!isObject(targetVal.components)) {
    return results;
  }

  const componentTypes = [
    'schemas',
    'responses',
    'parameters',
    'examples',
    'requestBodies',
    'headers',
    'links',
    'callbacks',
  ];

  for (const type of componentTypes) {
    const resultsForType = this.functions.unreferencedReusableObject.call(
      this,
      targetVal.components[type],
      { reusableObjectsLocation: `#/components/${type}` },
      _paths,
      otherValues,
    );
    if (resultsForType !== void 0 && Array.isArray(resultsForType)) {
      results.push(...resultsForType);
    }
  }

  return results;
};

export default oasUnusedComponent;
