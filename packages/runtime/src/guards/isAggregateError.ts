import { isError } from 'lodash';

export function isAggregateError(maybeAggregateError: unknown): maybeAggregateError is Error & { errors: unknown[] } {
  return isError(maybeAggregateError) && maybeAggregateError.constructor.name === 'AggregateError';
}
