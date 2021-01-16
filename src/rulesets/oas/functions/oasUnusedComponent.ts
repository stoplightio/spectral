import type { IFunction, IFunctionContext, IFunctionResult } from '../../../types';

export const oasUnusedComponent: IFunction<{}> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  _paths,
  otherValues,
) {
  const results: IFunctionResult[] = [];

  if (targetVal.components === void 0) {
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

  componentTypes.forEach(type => {
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
  });

  return results;
};

export default oasUnusedComponent;
