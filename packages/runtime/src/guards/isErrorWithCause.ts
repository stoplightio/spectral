import { isError } from 'lodash';

export function isErrorWithCause(maybeErrorWithCause: unknown): maybeErrorWithCause is Error & { cause: unknown } {
  return isError(maybeErrorWithCause) && 'cause' in maybeErrorWithCause;
}
