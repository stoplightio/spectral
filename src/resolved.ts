import { IResolveError, IResolveResult, IResolveRunner } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, JsonPath } from '@stoplight/types';
import { IParsedResult } from './types';

export class Resolved implements IResolveResult {
  public refMap: Dictionary<string>;
  public result: unknown;
  public errors: IResolveError[];
  public runner: IResolveRunner;
  private _cache: Dictionary<IParsedResult> = {};

  constructor(parsed: IParsedResult, result: IResolveResult) {
    this._cache['/'] = parsed;
    this.refMap = result.refMap;
    this.result = result.result;
    this.errors = result.errors;
    this.runner = result.runner;
  }

  public isForeignDocument(path: JsonPath) {
    return false;
  }

  public getDocumentUriForJsonPath(path: JsonPath) {
    return '';
  }

  public getLocationForJsonPath(path: JsonPath, closest?: boolean): ILocation {
    if (this.isForeignDocument(path)) {
      // this._cache
    }

    return {
      uri: this.getDocumentUriForJsonPath(path),
      range: {} as any,
    };
  }
}
