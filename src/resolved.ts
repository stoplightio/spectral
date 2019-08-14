import { IResolveError, IResolveResult, IResolveRunner } from '@stoplight/json-ref-resolver/dist/types';
import { Dictionary, ILocation, JsonPath } from '@stoplight/types';
import { Segment } from '@stoplight/types/dist';
import { get } from 'lodash';
import { IParseMap, REF_METADATA } from './spectral';
import { IParsedResult } from './types';

export class Resolved implements IResolveResult {
  public refMap: Dictionary<string>;
  public result: unknown;
  public errors: IResolveError[];
  public runner: IResolveRunner;
  public format?: string | null;

  constructor(public spec: IParsedResult, result: IResolveResult, public parsedMap: IParseMap) {
    this.refMap = result.refMap;
    this.result = result.result;
    this.errors = result.errors;
    this.runner = result.runner;
    this.format = spec.format;
  }

  public getParsedForJsonPath(path: JsonPath) {
    let target: object = this.parsedMap.refs;
    const newPath = [...path];
    let segment: Segment;

    while (newPath.length > 0) {
      segment = newPath.shift()!;
      if (segment && segment in target) {
        target = target[segment];
      } else {
        newPath.unshift(segment);
        break;
      }
    }

    if (target) {
      return {
        path: [...get(target, [REF_METADATA, 'root'], []), ...newPath],
        doc: get(this.parsedMap.parsed, get(target, [REF_METADATA, 'ref']), this.spec),
      };
    }

    return {
      path: newPath,
      doc: this.spec,
    };
  }

  public getLocationForJsonPath(path: JsonPath, closest?: boolean): ILocation {
    const parsedResult = this.getParsedForJsonPath(path);
    const location = parsedResult.doc.getLocationForJsonPath(parsedResult.doc.parsed, parsedResult.path, closest);

    return {
      ...(parsedResult.doc.source && { uri: parsedResult.doc.source }),
      range:
        location !== undefined
          ? location.range
          : {
              start: {
                line: 0,
                character: 0,
              },
              end: {
                line: 0,
                character: 0,
              },
            },
    };
  }
}
