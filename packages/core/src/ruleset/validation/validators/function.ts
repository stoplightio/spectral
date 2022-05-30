import { isError } from 'lodash';
import type { RulesetFunction, RulesetFunctionWithValidator } from '../../../types';

export function validateFunction(fn: RulesetFunction | RulesetFunctionWithValidator, opts: unknown): string | void {
  if (!('validator' in fn)) return;

  try {
    const validator: RulesetFunctionWithValidator['validator'] = fn.validator.bind(fn);
    validator(opts);
  } catch (ex) {
    return isError(ex) ? ex.message : 'invalid options';
  }
}
