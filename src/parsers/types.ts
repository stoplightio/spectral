import { GetLocationForJsonPath, IParserResult } from '@stoplight/types';

export interface IParser<T extends IParserResult = IParserResult<unknown>> {
  parse(input: string): T;
  getLocationForJsonPath: GetLocationForJsonPath<T>;
}
