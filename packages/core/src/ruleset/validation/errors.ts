import type { ErrorObject } from 'ajv';
import type { IDiagnostic, JsonPath } from '@stoplight/types';

type RulesetValidationSingleError = Pick<IDiagnostic, 'message' | 'path'>;

export class RulesetValidationError extends Error implements RulesetValidationSingleError {
  constructor(public readonly message: string, public readonly path: JsonPath) {
    super(message);
  }
}

const RULE_INSTANCE_PATH = /^\/rules\/[^/]+/;
const GENERIC_INSTANCE_PATH = /^\/(?:aliases|extends|overrides(?:\/\d+\/extends)?)/;

export function convertAjvErrors(errors: ErrorObject[]): RulesetValidationError[] {
  const sortedErrors = [...errors]
    .sort((errorA, errorB) => {
      const diff = errorA.instancePath.length - errorB.instancePath.length;
      return diff === 0 ? (errorA.keyword === 'errorMessage' && errorB.keyword !== 'errorMessage' ? -1 : 0) : diff;
    })
    .filter((error, i, sortedErrors) => i === 0 || sortedErrors[i - 1].instancePath !== error.instancePath);

  const filteredErrors: ErrorObject[] = [];

  l: for (let i = 0; i < sortedErrors.length; i++) {
    const error = sortedErrors[i];
    const prevError = i === 0 ? null : sortedErrors[i - 1];

    if (GENERIC_INSTANCE_PATH.test(error.instancePath)) {
      let x = 1;
      while (i + x < sortedErrors.length) {
        if (
          sortedErrors[i + x].instancePath.startsWith(error.instancePath) ||
          !GENERIC_INSTANCE_PATH.test(sortedErrors[i + x].instancePath)
        ) {
          continue l;
        }

        x++;
      }
    } else if (prevError === null) {
      filteredErrors.push(error);
      continue;
    } else {
      const match = RULE_INSTANCE_PATH.exec(error.instancePath);

      if (match !== null && match[0] !== match.input && match[0] === prevError.instancePath) {
        filteredErrors.pop();
      }
    }

    filteredErrors.push(error);
  }

  return filteredErrors.flatMap(error =>
    error.keyword === 'x-spectral-runtime'
      ? (error.params.errors as RulesetValidationError[])
      : new RulesetValidationError(error.message ?? 'unknown error', error.instancePath.slice(1).split('/')),
  );
}
