import type { IFunction, IFunctionResult } from '../../../types';

export const oasOpSuccessResponse: IFunction = targetVal => {
  if (!targetVal) {
    return;
  }

  const results: IFunctionResult[] = [];
  const responses = Object.keys(targetVal);
  if (responses.filter(response => Number(response) >= 200 && Number(response) < 400).length === 0) {
    results.push({
      message: 'operations must define at least one 2xx or 3xx response',
    });
  }
  return results;
};

export default oasOpSuccessResponse;
