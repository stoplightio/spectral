import { getLocationForJsonPath as _getLocationForJsonPath, parseWithPointers, trapAccess } from '@stoplight/yaml';
import type { YamlParserResult as _YamlParserResult } from '@stoplight/yaml';
import type { ILocation, JsonPath } from '@stoplight/types';

import type { IParser } from './types';

export type YamlParserResult<T> = Omit<_YamlParserResult<T>, 'comments'>;

function getLocationForJsonPath<T>(result: YamlParserResult<T>, path: JsonPath): ILocation | undefined {
  return _getLocationForJsonPath(result as _YamlParserResult<T>, path);
}

export const parseYaml = (input: string): YamlParserResult<unknown> =>
  parseWithPointers(input, {
    ignoreDuplicateKeys: false,
    mergeKeys: true,
    preserveKeyOrder: true,
    attachComments: false,
  });

export const Yaml: IParser<YamlParserResult<unknown>> = {
  parse: parseYaml,
  getLocationForJsonPath,
  trapAccess,
};
