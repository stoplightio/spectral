import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOpIdUnique: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const { paths = {} } = _object;

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
    const meta = { ...ruleMeta, path: operationId.path };

    const res = ensureRule(() => {
      ids.filter(id => id.operationId === operationId.operationId).length.should.equal(1);
    }, meta);

    if (res) {
      results.push(res);
    }
  });

  return results;
};
