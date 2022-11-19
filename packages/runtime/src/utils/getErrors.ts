import { isAggregateError } from '../guards/isAggregateError';
import { isErrorWithCause } from '../guards/isErrorWithCause';

export function* getErrors(error: unknown): Iterable<unknown> {
  if (isAggregateError(error)) {
    for (const singleError of error.errors) {
      yield* getErrors(singleError);
    }
  } else if (isErrorWithCause(error) && error.cause !== void 0) {
    yield* getErrors(error.cause);
  } else {
    yield error;
  }
}
