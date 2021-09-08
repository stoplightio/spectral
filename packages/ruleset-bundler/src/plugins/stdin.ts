import type { Plugin } from 'rollup';

export const stdin = (input: string, name = '<stdin>'): Plugin => ({
  name: '@stoplight-spectral/stdin',
  resolveId(id) {
    if (id === name) {
      return id;
    }

    return;
  },
  load(id) {
    if (id === name) {
      return input;
    }

    return;
  },
});
