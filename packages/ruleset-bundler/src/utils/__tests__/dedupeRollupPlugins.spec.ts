import type { Plugin } from 'rollup';

import { dedupeRollupPlugins } from '../dedupeRollupPlugins';

describe('dedupeRollupPlugins util', () => {
  it('should keep plugins with different names', () => {
    const plugins: Plugin[] = [
      {
        name: 'plugin 1',
      },
      {
        name: 'plugin 2',
      },
      {
        name: 'plugin 3',
      },
    ];

    expect(dedupeRollupPlugins([...plugins])).toStrictEqual(plugins);
  });

  it('given the same plugin, should replace the first declaration', () => {
    const plugins: Plugin[] = [
      {
        name: 'plugin 1',
        cacheKey: 'key 1',
      },
      {
        name: 'plugin 2',
      },
      {
        name: 'plugin 1',
        cacheKey: 'key 2',
      },
      {
        name: 'plugin 1',
        cacheKey: 'key 3',
      },
    ];

    expect(dedupeRollupPlugins([...plugins])).toStrictEqual([
      {
        name: 'plugin 1',
        cacheKey: 'key 3',
      },
      {
        name: 'plugin 2',
      },
    ]);
  });
});
