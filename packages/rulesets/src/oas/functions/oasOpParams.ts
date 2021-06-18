import type { IFunction, IFunctionResult } from '@stoplight/spectral-core';
import type { Dictionary } from '@stoplight/types';
import { isObject } from './utils/isObject';

function computeFingerprint(param: Record<string, unknown>): string {
  return `${String(param.in)}-${String(param.name)}`;
}

export const oasOpParams: IFunction = (params, _opts, { given }) => {
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

  const count: Dictionary<number[]> = {
    body: [],
    formData: [],
  };
  const list: string[] = [];
  const duplicates: number[] = [];

  let index = -1;

  for (const param of params) {
    index++;

    if (!isObject(param)) continue;

    // skip params that are refs
    if ('$ref' in param) continue;

    // Operations must have unique `name` + `in` parameters.
    const fingerprint = computeFingerprint(param);
    if (list.includes(fingerprint)) {
      duplicates.push(index);
    } else {
      list.push(fingerprint);
    }

    if (typeof param.in === 'string' && param.in in count) {
      count[param.in].push(index);
    }
  }

  if (duplicates.length > 0) {
    for (const i of duplicates) {
      results.push({
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: [...given, i],
      });
    }
  }

  if (count.body.length > 0 && count.formData.length > 0) {
    results.push({
      message: 'Operation cannot have both `in:body` and `in:formData` parameters.',
    });
  }

  if (count.body.length > 1) {
    for (let i = 1; i < count.body.length; i++) {
      results.push({
        message: 'Operation has already at least one instance of the `in:body` parameter.',
        path: [...given, count.body[i]],
      });
    }
  }

  return results;
};

export default oasOpParams;
