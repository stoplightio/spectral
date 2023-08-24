import { isError } from 'lodash';

export function printError(maybeError: unknown): string {
  if (isError(maybeError)) {
    return maybeError.message;
  }

  return 'unknown error';
}
