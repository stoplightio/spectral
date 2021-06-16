import AJV, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import { isPlainObject } from '@stoplight/json';

import { FileRule, IRulesetFile } from '../types/ruleset';
import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import * as shared from '../meta/shared.json';
import { IRule } from '../types';
import { printPath, PrintStyle } from '../utils';

const ajv = new AJV({ allErrors: true, allowUnionTypes: true, strict: true, strictRequired: false });
addFormats(ajv);
addErrors(ajv);
const validate = ajv.addSchema(ruleSchema).addSchema(shared).compile(rulesetSchema);

export class RulesetValidationError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}

const RULE_INSTANCE_PATH = /^\/rules\/[^/]+/;

class RulesetAjvValidationError extends RulesetValidationError {
  constructor(public ruleset: Record<string, unknown>, public errors: ErrorObject[]) {
    super(RulesetAjvValidationError.serializeAjvErrors(ruleset, errors));
  }

  public static serializeAjvErrors(ruleset: Record<string, unknown>, errors: ErrorObject[]): string {
    const sortedErrors = [...errors]
      .sort((errorA, errorB) => {
        const diff = errorA.instancePath.length - errorB.instancePath.length;
        return diff === 0 ? (errorA.keyword === 'errorMessage' && errorB.keyword !== 'errorMessage' ? -1 : 0) : diff;
      })
      .filter((error, i, sortedErrors) => i === 0 || sortedErrors[i - 1].instancePath !== error.instancePath);

    const filteredErrors: ErrorObject[] = [];

    for (let i = 0; i < sortedErrors.length; i++) {
      const error = sortedErrors[i];
      const prevError = i === 0 ? null : sortedErrors[i - 1];

      if (prevError === null) {
        filteredErrors.push(error);
        continue;
      }

      if (error.instancePath.startsWith('/extends/')) {
        if (prevError.instancePath === '/extends') {
          filteredErrors.pop();
        }
      } else {
        const match = RULE_INSTANCE_PATH.exec(error.instancePath);

        if (match !== null && match[0] !== match.input && match[0] === prevError.instancePath) {
          filteredErrors.pop();
        }
      }

      filteredErrors.push(error);
    }

    return filteredErrors
      .map(
        ({ message, instancePath }) =>
          `Error at ${printPath(instancePath.slice(1).split('/'), PrintStyle.Pointer)}: ${message ?? ''}`,
      )
      .join('\n');
  }
}

export function assertValidRuleset(ruleset: unknown): IRulesetFile {
  if (!isPlainObject(ruleset)) {
    throw new Error('Provided ruleset is not an object');
  }

  if (!('rules' in ruleset) && !('extends' in ruleset)) {
    throw new Error('Ruleset must have rules or extends property');
  }

  if (!validate(ruleset)) {
    throw new RulesetAjvValidationError(ruleset, validate.errors ?? []);
  }

  return ruleset as IRulesetFile;
}

export function isValidRule(rule: FileRule): rule is IRule {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}
