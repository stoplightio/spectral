import type { IFunction, IFunctionContext, IFunctionResult } from '../../../types';
import { isObject } from './utils/isObject';

export const oasUnusedComponent: IFunction = function (this: IFunctionContext, targetVal, opts, _paths, otherValues) {
  if (!isObject(targetVal) || !isObject(targetVal.components)) {
    return;
  }

  const results: IFunctionResult[] = [];
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
