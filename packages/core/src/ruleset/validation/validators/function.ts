import type { RulesetFunction, RulesetFunctionWithValidator } from '../../../types';
import { wrapError } from './common/error';

function assertRulesetFunction(
  maybeRulesetFunction: unknown,
): asserts maybeRulesetFunction is RulesetFunction | RulesetFunctionWithValidator {
  if (typeof maybeRulesetFunction !== 'function') {
    throw Error('Function is not defined');
  }
}

export function validateFunction(
  fn: unknown | RulesetFunction | RulesetFunctionWithValidator,
  opts: unknown,
  path: string,
): Error | void {
  try {
    assertRulesetFunction(fn);

    if (!('validator' in fn)) return;

    const validator: RulesetFunctionWithValidator['validator'] = fn.validator.bind(fn);
    validator(opts);
  } catch (ex) {
    return wrapError(ex, path);
  }
}
