import { Spectral } from '../../../../../index';
import { commonOasFunctions } from '../../../index';

import { rules } from '../../../ruleset.json';

const ruleset = { functions: commonOasFunctions(), rules };

describe('oasOpIdUnique', () => {
  const s = new Spectral();

  s.addFunctions(ruleset.functions || {});
  s.addRules({
    // @ts-ignore
    'operation-operationId-unique': Object.assign(ruleset.rules['operation-operationId-unique'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id2',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors on different path operations same id', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id1',
          },
        },
      },
    });

    expect(results).toMatchSnapshot();
  });

  test('return errors on same path operations same id', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
          post: {
            operationId: 'id1',
          },
        },
      },
    });

    expect(results).toMatchSnapshot();
  });
});
