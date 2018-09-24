import * as types from './types';
import { IRuleResult } from '../types';

import * as jp from 'jsonpath';
import * as should from 'should';
import { AssertionError } from 'assert';

const regexFromString = (regex: string) =>
  new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

const ensureRule = (shouldAssertion: Function): void | AssertionError => {
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

const generateRule = (r: types.LintRule): ((object: any) => AssertionError[]) => {
  switch (r.type) {
    case 'truthy':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];

        if (!Array.isArray(r.truthy)) r.truthy = [r.truthy];

        for (const property of r.truthy) {
          const res = ensureRule(() => {
            object.should.have.property(property);
            object[property].should.not.be.empty();
          });
          if (res) {
            results.push(res);
          }
        }

        if (r.properties) {
          const res = ensureRule(() => {
            // Ignore vendor extensions, for reasons like our the resolver adding x-miro
            const keys = Object.keys(object).filter(key => !key.startsWith('x-'));
            should(keys.length).be.exactly(r.properties);
          });
          if (res) {
            results.push(res);
          }
        }

        return results;
      };
      break;
    case 'alphabetical':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];
        if (r.alphabetical.properties && !Array.isArray(r.alphabetical.properties)) {
          r.alphabetical.properties = [r.alphabetical.properties];
        }

        for (const property of r.alphabetical.properties) {
          if (!object[property] || object[property].length < 2) {
            continue;
          }

          const arrayCopy: object[] = object[property].slice(0);

          // If we aren't expecting an object keyed by a specific property, then treat the
          // object as a simple array.
          if (r.alphabetical.keyedBy) {
            const keyedBy = r.alphabetical.keyedBy;
            arrayCopy.sort((a, b) => {
              if (a[keyedBy] < b[keyedBy]) {
                return -1;
              } else if (a[keyedBy] > b[keyedBy]) {
                return 1;
              }
              return 0;
            });
          } else {
            arrayCopy.sort();
          }

          const res = ensureRule(() => {
            object.should.have.property(property);
            object[property].should.be.deepEqual(arrayCopy);
          });
          if (res) {
            results.push(res);
          }
        }
        return results;
      };
      break;
    case 'or':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];

        let found = false;
        for (const property of r.or) {
          if (typeof object[property] !== 'undefined') {
            found = true;
            break;
          }
        }
        const res = ensureRule(() => {
          found.should.be.exactly(true, r.description);
        });
        if (res) {
          results.push(res);
        }
        return results;
      };
      break;
    case 'xor':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];

        let found = false;
        for (const property of r.xor) {
          if (typeof object[property] !== 'undefined') {
            if (found) {
              const res = ensureRule(() => {
                should.fail(true, false, r.description);
              });
              if (res) {
                results.push(res);
              }
            }
            found = true;
          }
        }

        const res = ensureRule(() => {
          found.should.be.exactly(true, r.description);
        });
        if (res) {
          results.push(res);
        }

        return results;
      };
      break;
    case 'pattern':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];
        const { omit, property, split, value } = r.pattern;

        // if the collected object is not an object/array, set our target to be
        // the object itself
        let target: any;
        if (typeof object === 'object') {
          if (property === '*') {
            target = Object.keys(object);
          } else {
            target = object[property];
          }
        } else {
          target = object;
        }

        if (target) {
          const process = (target: any) => {
            let components = [];
            if (split) {
              components = target.split(split);
            } else {
              components.push(target);
            }

            const re = new RegExp(value);
            for (let component of components) {
              if (omit) component = component.split(omit).join('');
              if (component) {
                const res = ensureRule(() => {
                  should(re.test(component)).be.exactly(
                    true,
                    `${r.description}, but received: ${component}`
                  );
                });
                if (res) {
                  results.push(res);
                }
              }
            }
          };

          if (Array.isArray(target)) {
            target.forEach(process);
          } else {
            process(target);
          }
        }
        return results;
      };
      break;
    case 'notContain':
      return (obj: object): AssertionError[] => {
        const results: AssertionError[] = [];
        const { value, properties } = r.notContain;

        for (const property of properties) {
          if (Object.hasOwnProperty(property)) {
            const res = ensureRule(() => {
              obj[property].should.be.a
                .String()
                .and.not.match(regexFromString(value), r.description);
            });
            if (res) {
              results.push(res);
            }
          }
        }
        return results;
      };
      break;
    case 'notEndWith':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];
        const { value, property } = r.notEndWith;
        const process = (target: any) => {
          const res = ensureRule(() => {
            target.should.not.endWith(value);
          });
          if (res) {
            results.push(res);
          }
        };

        if (property === '*') {
          object = Object.keys(object);
        }

        if (Array.isArray(object)) {
          object.forEach((obj: any) => {
            if (obj[property]) {
              process(obj[property]);
            }
          });
        } else if (object[property]) {
          process(object[property]);
        }
        return results;
      };
      break;
    case 'maxLength':
      return (object: object): AssertionError[] => {
        const results: AssertionError[] = [];
        const { value, property = undefined } = r.maxLength;

        let target: any;
        if (property) {
          if (object[property] && typeof object[property] === 'string') {
            target = object[property];
          }
        } else {
          target = object;
        }

        if (target) {
          const res = ensureRule(() => {
            target.length.should.be.belowOrEqual(value);
          });
          if (res) {
            results.push(res);
          }
        }
        return results;
      };
      break;
  }
};

interface Options {
  defaultSeverity: 'warn' | 'error';
}

class Linter {
  readonly opts: Options;

  public rules: object = {};
  // paths is an internal cache of rules keyed by their path element. This is
  // used primarily to ensure that we only issue one JSON path query per unique
  // path.
  private paths: object = {};

  constructor(opts?: Options) {
    if (opts) {
      this.opts = opts;
    } else {
      this.opts = {
        defaultSeverity: 'warn',
      };
    }
  }

  public lint = (object: object): IRuleResult[] => {
    const results: IRuleResult[] = [];

    for (const path in this.paths) {
      for (const ruleName of this.paths[path]) {
        const { rule, apply } = this.rules[ruleName];

        if (!rule.enabled) {
          continue;
        }

        if (rule.path !== path) {
          console.warn(
            `Rule '${
              rule.name
            } was categorized under an incorrect path. Was under ${path}, but rule path is set to ${
              rule.path
            }`
          );
          continue;
        }

        try {
          const nodes = jp.nodes(object, path);
          for (const n of nodes) {
            const { path, value } = n;

            try {
              const result: AssertionError[] = apply(value);
              result.forEach(res => {
                results.push({
                  path,
                  ruleName,
                  type: 'lint',
                  severity: rule.severity,
                  message: rule.description + ' -> ' + res.message,
                });
              });
            } catch (e) {
              console.warn(
                `Encountered error when running rule '${ruleName}' on node at path '${path}':\n${e}`
              );
            }
          }
        } catch (e) {
          console.error(`Unable to run rule '${ruleName}':\n${e}`);
        }
      }
    }

    return results;
  };

  public registerRules = (rules: types.LintRule[]) => {
    rules.forEach(rule => this.registerRule(rule));
  };

  public registerRule = (rule: types.LintRule) => {
    if (!rule.severity) {
      rule.severity = this.opts.defaultSeverity;
    }

    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${rule.name}': ${rule.path}\n\n${e}`);
    }

    // update rules object
    this.rules[rule.name] = {
      rule: rule,
      apply: generateRule(rule),
    };

    // update paths object (ensure uniqueness)
    if (!this.paths[rule.path]) {
      this.paths[rule.path] = [];
    }
    let present = false;
    for (const ruleName of this.paths[rule.path]) {
      if (ruleName === rule.name) {
        present = true;
        break;
      }
    }
    if (!present) {
      this.paths[rule.path].push(rule.name);
    }
  };
}

export { Linter, types };
