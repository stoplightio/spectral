import type { Plugin } from 'rollup';

export const stdin = (input: string, name = '<stdin>'): Plugin => ({
  name: '@stoplight-spectral/stdin',
  resolveId: id => (id === name ? id : null),
  load: id => (id === name ? input : null),
});
