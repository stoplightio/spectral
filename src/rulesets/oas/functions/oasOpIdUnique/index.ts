import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';
import { IFunctionPaths } from '../../../../types/spectral';

export const oasOpIdUnique: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>, functionPaths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object } = opts;
  const { paths = {} } = object;

  const ids: any[] = [];

  for (const path in paths) {
    if (Object.keys(paths[path]).length > 0) {
      for (const operation in paths[path]) {
        if (operation !== 'parameters') {
          const { operationId } = paths[path][operation];

          if (operationId) {
            ids.push({ path: ['$', 'paths', path, operation, 'operationId'], operationId });
          }
        }
      }
    }
  }

  ids.forEach(operationId => {
    const res = ensureRule(() => {
      ids.filter(id => id.operationId === operationId.operationId).length.should.equal(1);
    }, operationId.path || functionPaths.given);

    if (res) {
      results.push(res);
    }
  });

  return results;
};
