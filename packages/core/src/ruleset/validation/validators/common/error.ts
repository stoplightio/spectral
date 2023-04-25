import { isError } from 'lodash';
import AggregateError from 'es-aggregate-error';

import { RulesetValidationError } from '../../errors';
import { isAggregateError } from '../../../../guards/isAggregateError';

function toRulesetValidationError(this: ReadonlyArray<string>, ex: unknown): RulesetValidationError {
  if (ex instanceof RulesetValidationError) {
    ex.path.unshift(...this);
    return ex;
  }

  return new RulesetValidationError('generic-validation-error', isError(ex) ? ex.message : String(ex), [...this]);
}

export function wrapError(ex: unknown, path: string): Error {
  const parsedPath = toParsedPath(path);

  if (isAggregateError(ex)) {
    return new AggregateError(ex.errors.map(toRulesetValidationError, parsedPath));
  }

  return toRulesetValidationError.call(parsedPath, ex);
}

export function toParsedPath(path: string): string[] {
  return path.slice(1).split('/');
}
