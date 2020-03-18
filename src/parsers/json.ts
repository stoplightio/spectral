import { getLocationForJsonPath, JsonParserResult, parseWithPointers, trapAccess } from '@stoplight/json';
import { IParser } from './types';

export const parseJson = (input: string) =>
  parseWithPointers(input, { ignoreDuplicateKeys: false, preserveKeyOrder: true });

export const Json: IParser<JsonParserResult<unknown>> = {
  parse: parseJson,
  getLocationForJsonPath,
  trapAccess,
};
