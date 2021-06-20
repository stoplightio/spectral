import Ajv, { _, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import { isPlainObject } from '@stoplight/json';
import { printPath, PrintStyle } from '@stoplight/spectral-runtime';

import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import * as shared from '../meta/shared.json';
import type { FileRuleDefinition, RuleDefinition, RulesetDefinition } from './types';

const message = _`'spectral-message'`;

const ajv = new Ajv({ allErrors: true, strict: true, strictRequired: false });
addFormats(ajv);
addErrors(ajv);
ajv.addKeyword({
  keyword: 'spectral-runtime',
  schemaType: 'string',
  error: {
    message(ctx) {
      return _`${ctx.data}[Symbol.for(${message})]`;
    },
  },
  code(cxt) {
    const { data } = cxt;

    switch (cxt.schema as unknown) {
      case 'spectral-format':
        cxt.fail(_`typeof ${data} !== "function"`);
        break;
      case 'spectral-function':
        cxt.pass(_`typeof ${data}.function === "function"`);
        cxt.pass(
          _`(() => { try { ${data}.function.validator?.('functionOptions' in ${data} ? ${data} : null); } catch (e) { ${data}[${message}] = e.message } })()`,
        );
        break;
    }
  },
});

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

    l: for (let i = 0; i < sortedErrors.length; i++) {
      const error = sortedErrors[i];
      const prevError = i === 0 ? null : sortedErrors[i - 1];

      if (error.instancePath.startsWith('/extends')) {
        let x = 1;
        while (i + x < sortedErrors.length) {
          if (
            sortedErrors[i + x].instancePath.startsWith(error.instancePath) ||
            !sortedErrors[i + x].instancePath.startsWith('/extends')
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

    return filteredErrors
      .map(
        ({ message, instancePath }) =>
          `Error at ${printPath(instancePath.slice(1).split('/'), PrintStyle.Pointer)}: ${message ?? ''}`,
      )
      .join('\n');
  }
}

export function assertValidRuleset(ruleset: unknown): asserts ruleset is RulesetDefinition {
  if (!isPlainObject(ruleset)) {
    throw new Error('Provided ruleset is not an object');
  }

  if (!('rules' in ruleset) && !('extends' in ruleset)) {
    throw new RulesetValidationError('Ruleset must have rules or extends property');
  }

  if (!validate(ruleset)) {
    throw new RulesetAjvValidationError(ruleset, validate.errors ?? []);
  }
}

export function isValidRule(rule: FileRuleDefinition): rule is RuleDefinition {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

export function assertValidRule(rule: FileRuleDefinition): asserts rule is RuleDefinition {
  if (!isValidRule(rule)) {
    throw new TypeError('Invalid rule');
  }
}
