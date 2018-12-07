const _get = require('lodash/get');

import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRule, IRuleFunction, IRuleOpts, IRuleResult, Path } from '../../../../types';

export type functionName = 'oasOpSecurityDefined';

export interface IOasOpSecurityDefinedRule extends IRule {
  function: functionName;
  input: {
    schemesPath: Path;
  };
}

export const oasOpSecurityDefined: IRuleFunction<IOasOpSecurityDefinedRule> = (
  opts: IRuleOpts<IOasOpSecurityDefinedRule>
) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;
  const { paths = {} } = object;
  const schemes = _get(object, rule.then.functionOptions.schemesPath) || {};
  const allDefs = Object.keys(schemes);

  for (const path in paths) {
    if (Object.keys(paths[path]).length > 0)
      for (const operation in paths[path]) {
        if (operation !== 'parameters') {
          const { security = [] } = paths[path][operation];

          for (const index in security) {
            if (security[index]) {
              const securityKey = Object.keys(security[index])[0];

              const res = ensureRule(
                () => {
                  allDefs.should.containEql(securityKey);
                },
                ['$', 'paths', path, operation, 'security', index]
              );

              if (res) {
                results.push(res);
              }
            }
          }
        }
      }
  }

  return results;
};
