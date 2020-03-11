import { getLocationForJsonPath, parseWithPointers, trapAccess, YamlParserResult } from '@stoplight/yaml';
import { IParser } from './types';

export const parseYaml = (input: string) =>
  parseWithPointers(input, {
    ignoreDuplicateKeys: false,
    mergeKeys: true,
    preserveKeyOrder: true,
  });

export const Yaml: IParser<YamlParserResult<unknown>> = {
  parse: parseYaml,
  getLocationForJsonPath,
  trapAccess,
};
