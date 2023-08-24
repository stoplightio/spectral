import type { RulesetFunction, RulesetFunctionWithValidator } from '../../../types';
import { toParsedPath, wrapError } from './common/error';
import { RulesetValidationError } from '../errors';

function assertRulesetFunction(
  maybeRulesetFunction: unknown,
): asserts maybeRulesetFunction is RulesetFunction | RulesetFunctionWithValidator {
  if (typeof maybeRulesetFunction !== 'function') {
    throw ReferenceError('Function is not defined');
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
    if (ex instanceof ReferenceError) {
      return new RulesetValidationError('undefined-function', ex.message, [...toParsedPath(path), 'function']);
    }

    return wrapError(ex, path);
  }
}
