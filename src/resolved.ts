import { IResolveError, IResolveResult, IResolveRunner } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, JsonPath } from '@stoplight/types';
import { get } from 'lodash';
import { ANNOTATION } from './resolvers/http-and-file';
import { IParsedResult } from './types';

export class Resolved implements IResolveResult {
  public refMap: Dictionary<string>;
  public result: unknown;
  public errors: IResolveError[];
  public runner: IResolveRunner;
  private _cache: Dictionary<IParsedResult> = {};

  constructor(private _parsed: IParsedResult, result: IResolveResult) {
    this.refMap = result.refMap;
    this.result = result.result;
    this.errors = result.errors;
    this.runner = result.runner;
    console.log(this.refMap, this._cache);

    console.log(this._parsed);
  }

  public getDocumentUriForJsonPath(path: JsonPath) {
    return get(this.result, [...path, ANNOTATION, 'uri']);
  }

  public getContentForJsonPath(path: JsonPath) {
    return get(this.result, [...path, ANNOTATION, 'content']);
  }
  //
  // private _parseContent(path: string) {
  //
  // }

  public getLocationForJsonPath(path: JsonPath, closest?: boolean): ILocation {
    console.log(this.refMap);
    return {
      uri: this.getDocumentUriForJsonPath(path),
      range: {
        start: {},
        end: {},
      } as any,
    };
  }
}
