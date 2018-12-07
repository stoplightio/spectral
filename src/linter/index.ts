import { PathComponent } from 'jsonpath';
import { filter, omitBy } from 'lodash';
import { IRule, IRuleOpts, IRuleResult } from '../types';
import { IRuleEntry, IRunOpts } from '../types/spectral';
const get = require('lodash/get');
const has = require('lodash/has');

// TODO(SO-23): unit test but mock whatShouldBeLinted
export function lintNode(
  ruleEntry: IRuleEntry,
  opts: IRunOpts,
  node: { path: PathComponent[]; value: any }
): IRuleResult[] {
  const conditioning = whatShouldBeLinted(node.value, ruleEntry.rule);
  // If the 'when' condition is not satisfied, simply don't run the linter
  if (!conditioning.lint) {
    return [];
  }

  const opt: IRuleOpts = {
    object: conditioning.value,
    rule: ruleEntry.rule,
  };

  if (ruleEntry.rule.given === '$') {
    // allow resolved and stringified targets to be passed to rules when operating on
    // the root path
    if (opts.resolvedTarget) {
      opt.resObj = opts.resolvedTarget;
    }
  }

  return ruleEntry.apply(opt, {
    given: node.path,
  });
}

// TODO(SO-23): unit test idividually
export function whatShouldBeLinted(originalValue: any, rule: IRule): { lint: boolean; value: any } {
  const when = rule.when;
  if (!when) {
    return {
      lint: true,
      value: originalValue,
    };
  }

  const pattern = when.pattern;
  const field = when.field;
  // what if someone's field is called '@key'?
  const isKey = field === '@key';

  if (!pattern) {
    // - if no pattern given
    //  - if field is @key THEN check if object has ANY key
    //  - else check if object[field] exists (MAY exist and be undefined!)
    if (isKey) {
      return keyAndOptionalPattern(originalValue);
    }
    return {
      lint: has(originalValue, field),
      value: originalValue,
    };
  }

  if (isKey) {
    return keyAndOptionalPattern(originalValue, pattern);
  }

  const fieldValue = String(get(originalValue, when.field));

  return {
    lint: fieldValue.match(pattern) !== null,
    value: originalValue,
  };
}

function keyAndOptionalPattern(originalValue: any, pattern?: string) {
  const type = typeof originalValue;
  switch (type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'bigint':
    case 'undefined':
    case 'function':
      return {
        lint: false,
        value: originalValue,
      };
    case 'object':
      if (originalValue === null) {
        return {
          lint: false,
          value: originalValue,
        };
      } else if (Array.isArray(originalValue)) {
        const leanValue = pattern
          ? filter(originalValue, (v, index) => {
              return String(index).match(pattern) !== null;
            })
          : originalValue;
        return {
          lint: !!leanValue.length,
          value: leanValue,
        };
      } else {
        const leanValue = pattern
          ? omitBy(originalValue, (v, key) => {
              return key.match(pattern) === null;
            })
          : originalValue;
        return {
          lint: !!Object.keys(leanValue).length,
          value: leanValue,
        };
      }
    default:
      throw new Error(
        `value: "${originalValue}" of type: "${type}" is an unsupported type of value for the "when" statement`
      );
  }
}
