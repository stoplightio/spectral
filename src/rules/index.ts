import * as types from 'spectral/types';
import {
  alphabetical,
  truthy,
  or,
  xor,
  pattern,
  notContain,
  notEndWith,
  maxLength,
} from 'spectral/rules/lint';

// import * as jp from 'jsonpath';
import { AssertionError } from 'assert';

export const ensureRule = (shouldAssertion: Function): void | AssertionError => {
  try {
    shouldAssertion();
  } catch (error) {
    // rethrow when not a lint error
    if (!error.name || error.name !== 'AssertionError') {
      throw error;
    }

    return error;
  }
};

export const generateRule = (r: types.LintRule): ((object: any) => AssertionError[]) => {
  switch (r.type) {
    case 'truthy':
      return truthy(r);
      break;
    case 'alphabetical':
      return alphabetical(r);
      break;
    case 'or':
      return or(r);
      break;
    case 'xor':
      return xor(r);
      break;
    case 'pattern':
      return pattern(r);
      break;
    case 'notContain':
      return notContain(r);
      break;
    case 'notEndWith':
      return notEndWith(r);
      break;
    case 'maxLength':
      return maxLength(r);
      break;
  }
};

// interface Options {
//   defaultSeverity: 'warn' | 'error';
// }

// interface IRuleEntry {
//   rule: types.LintRule;
//   apply: (object: any) => AssertionError[];
// }

// interface IRuleStore {
//   [index: string]: IRuleEntry;
// }

// export class RuleManager {
//   readonly opts: Options;

//   public rules: IRuleStore = {};

//   constructor(opts?: Options) {
//     if (opts) {
//       this.opts = opts;
//     } else {
//       this.opts = {
//         defaultSeverity: 'warn',
//       };
//     }
//   }

//   public registerRules = (rules: types.LintRule[]) => {
//     rules.forEach(rule => this.registerRule(rule));
//   };

//   public registerRule = (rule: types.LintRule) => {
//     if (!rule.severity) {
//       rule.severity = this.opts.defaultSeverity;
//     }

//     try {
//       jp.parse(rule.path);
//     } catch (e) {
//       throw new SyntaxError(`Invalid JSON path for rule '${rule.name}': ${rule.path}\n\n${e}`);
//     }

//     // update rules object
//     this.rules[rule.name] = {
//       rule: rule,
//       apply: generateRule(rule),
//     };

//     // update paths object (ensure uniqueness)
//     if (!this.paths[rule.path]) {
//       this.paths[rule.path] = [];
//     }
//     let present = false;
//     for (const ruleName of this.paths[rule.path]) {
//       if (ruleName === rule.name) {
//         present = true;
//         break;
//       }
//     }
//     if (!present) {
//       this.paths[rule.path].push(rule.name);
//     }
//   };
// }
