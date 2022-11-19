import type { ErrorObject } from 'ajv';
import type { IDiagnostic, JsonPath } from '@stoplight/types';
import { isAggregateError } from '../../guards/isAggregateError';

export type RulesetValidationErrorCode =
  | 'generic-validation-error'
  | 'invalid-ruleset-definition'
  | 'invalid-parser-options-definition'
  | 'invalid-alias-definition'
  | 'invalid-extend-definition'
  | 'invalid-rule-definition'
  | 'invalid-override-definition'
  | 'invalid-function-options'
  | 'invalid-given-definition'
  | 'invalid-severity'
  | 'invalid-format'
  | 'undefined-function'
  | 'undefined-alias';

interface IRulesetValidationSingleError extends Pick<IDiagnostic, 'message' | 'path'> {
  readonly code: RulesetValidationErrorCode;
}

export class RulesetValidationError extends Error implements IRulesetValidationSingleError {
  constructor(
    public readonly code: RulesetValidationErrorCode,
    public readonly message: string,
    public readonly path: JsonPath,
  ) {
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
    const prevError = filteredErrors.length === 0 ? null : filteredErrors[filteredErrors.length - 1];

    if (error.keyword === 'if') continue;

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

  return filteredErrors.flatMap(error => {
    if (error.keyword === 'x-spectral-runtime') {
      return flatErrors(error.params.errors);
    }

    const path = error.instancePath.slice(1).split('/');
    return new RulesetValidationError(inferErrorCode(path, error.keyword), error.message ?? 'unknown error', path);
  });
}

function flatErrors(error: RulesetValidationError | AggregateError): RulesetValidationError | RulesetValidationError[] {
  if (isAggregateError(error)) {
    return error.errors.flatMap(flatErrors);
  }

  return error;
}

function inferErrorCode(path: string[], keyword: string): RulesetValidationErrorCode {
  if (path.length === 0) {
    return 'generic-validation-error';
  }

  if (path.length === 1 && keyword !== 'errorMessage') {
    return 'invalid-ruleset-definition';
  }

  switch (path[0]) {
    case 'rules':
      return inferErrorCodeFromRulesError(path);
    case 'parserOptions':
      return 'invalid-parser-options-definition';
    case 'aliases':
      return inferErrorCodeFromAliasesError(path);
    case 'extends':
      return 'invalid-extend-definition';
    case 'overrides':
      return inferErrorCodeFromOverrideError(path, keyword);
    case 'formats':
      if (path.length === 1) {
        return 'invalid-ruleset-definition';
      }

      return 'invalid-format';
    default:
      return 'generic-validation-error';
  }
}

function inferErrorCodeFromRulesError(path: string[]): RulesetValidationErrorCode {
  if (path.length === 3 && path[2] === 'severity') {
    return 'invalid-severity';
  }

  if (path.length === 4 && path[2] === 'formats') {
    return 'invalid-format';
  }

  if (path.length === 4 && path[2] === 'given') {
    return 'invalid-given-definition';
  }

  return 'invalid-rule-definition';
}

function inferErrorCodeFromOverrideError(path: string[], keyword: string): RulesetValidationErrorCode {
  if (path.length >= 3) {
    return inferErrorCode(path.slice(2), keyword);
  }

  return 'invalid-override-definition';
}

function inferErrorCodeFromAliasesError(path: string[]): RulesetValidationErrorCode {
  if (path.length === 6) {
    if (path[4] === 'given') {
      return 'invalid-given-definition';
    }

    if (path[4] === 'formats') {
      return 'invalid-format';
    }
  }

  return 'invalid-alias-definition';
}
