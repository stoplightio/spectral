import { parseWithPointers } from '@stoplight/json';

export const parseJson = (input: string) =>
  parseWithPointers(input, { ignoreDuplicateKeys: false, preserveKeyOrder: true });
