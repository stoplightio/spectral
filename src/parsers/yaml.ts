import { parseWithPointers } from '@stoplight/yaml';

export const parseYaml = (input: string) =>
  parseWithPointers(input, {
    ignoreDuplicateKeys: false,
    mergeKeys: true,
    preserveKeyOrder: true,
  });
