import { GetLocationForJsonPath, IParserResult } from '@stoplight/types';

export interface IParser<R extends IParserResult = IParserResult<unknown>> {
  parse(input: string): R;
  getLocationForJsonPath: GetLocationForJsonPath<R>;
  trapAccess<T extends object = object>(obj: T): T;
}
