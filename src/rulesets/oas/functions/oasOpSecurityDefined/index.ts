import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOpSecurityDefined: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const { paths = {}, securityDefinitions = {} } = _object;

  const allDefs = Object.keys(securityDefinitions);

  for (const path in paths) {
    if (Object.keys(paths[path]).length > 0)
      for (const operation in paths[path]) {
        if (operation !== 'parameters') {
          const { security = [] } = paths[path][operation];

          for (const index in security) {
            if (security[index]) {
              const securityKey = Object.keys(security[index])[0];

              const meta = {
                ...ruleMeta,
                path: ['$', 'paths', path, operation, 'security', index],
              };

              const res = ensureRule(() => {
                allDefs.should.containEql(securityKey);
              }, meta);

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
