import { PathComponent } from 'jsonpath';
const get = require('lodash/get');
const has = require('lodash/has');
const filter = require('lodash/filter');
const omitBy = require('lodash/omitBy');

import { IFunction, IRuleResult, IRunOpts, IRunRule, IThen } from './types';

// TODO(SO-23): unit test but mock whatShouldBeLinted
export const lintNode = (
  node: { path: PathComponent[]; value: any },
  rule: IRunRule,
  then: IThen<string, any>,
  apply: IFunction,
  opts: IRunOpts
): IRuleResult[] => {
  const conditioning = whatShouldBeLinted(node.value, rule);

  // If the 'when' condition is not satisfied, simply don't run the linter
  if (!conditioning.lint) {
    return [];
  }

  let targetValue = conditioning.value;

  // const opt: IRuleOpts = {
  //   object: conditioning.value,
  //   rule,
  // };

  // if (rule.given === '$') {
  //   // allow resolved and stringified targets to be passed to rules when operating on
  //   // the root path
  //   if (opts.resolvedTarget) {
  //     opt.resObj = opts.resolvedTarget;
  //   }
  // }

  if (rule.then && then.field) {
    targetValue = get(targetValue, then.field);
  }

  const results =
    apply(
      targetValue,
      then.functionOptions || {},
      {
        given: node.path,
        target: node.path, // todo, node.path + rule.then.field
      },
      {
        original: {},
        given: node.value,
        resolved: opts.resolvedTarget,
      }
    ) || [];

  return results.map(result => {
    return {
      path: result.path || node.path,
      message: result.message,
    };
  });
};

// TODO(SO-23): unit test idividually
export const whatShouldBeLinted = (originalValue: any, rule: IRunRule): { lint: boolean; value: any } => {
  const when = rule.when;
  if (!when) {
    return {
      lint: true,
      value: originalValue,
    };
  }

  const pattern = when.pattern;
  const field = when.field;

  // TODO: what if someone's field is called '@key'? should we use @@key?
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
};

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
          ? filter(originalValue, (_v: any, index: any) => {
              return String(index).match(pattern) !== null;
            })
          : originalValue;
        return {
          lint: !!leanValue.length,
          value: leanValue,
        };
      } else {
        const leanValue = pattern
          ? omitBy(originalValue, (_v: any, key: any) => {
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
