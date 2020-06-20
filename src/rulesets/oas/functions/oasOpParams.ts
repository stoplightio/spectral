import type { IFunction, IFunctionResult } from '../../../types';
import type { Dictionary } from '@stoplight/types';

function computeFingerprint(param: Dictionary<unknown>): string {
  return `${param.in}-${param.name}`;
}

export const oasOpParams: IFunction = params => {
  /**
   * This function verifies:
   *
   * 1. Operations must have unique `name` + `in` parameters.
   * 2. Operation cannot have both `in:body` and `in:formData` parameters
   * 3. Operation must have only one `in:body` parameter.
   */

  if (!Array.isArray(params)) return;

  if (params.length < 2) return;

  const results: IFunctionResult[] = [];

  const count = {
    body: 0,
    formData: 0,
  };
  const list: string[] = [];
  let hasDuplicateParams = false;

  for (const param of params) {
    if (param === null || typeof param !== 'object') continue;

    // skip params that are refs
    if ('$ref' in param) continue;

    // Operations must have unique `name` + `in` parameters.
    if (!hasDuplicateParams) {
      const fingerprint = computeFingerprint(param);
      if (list.includes(fingerprint)) {
        hasDuplicateParams = true;
      } else {
        list.push(fingerprint);
      }
    }

    if (param.in in count) {
      count[param.in]++;
    }
  }

  if (hasDuplicateParams) {
    results.push({
      message: 'Operation must have unique `name` + `in` parameters',
    });
  }

  if (count.body > 0 && count.formData > 0) {
    results.push({
      message: 'Operation cannot have both `in:body` and `in:formData` parameters',
    });
  }

  if (count.body > 1) {
    results.push({
      message: 'Operation has multiple instances of the `in:body` parameter',
    });
  }

  return results;
};

export default oasOpParams;
