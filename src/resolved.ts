import { IResolveError, IResolveResult } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, JsonPath, Segment } from '@stoplight/types';
import { get } from 'lodash';
import { IParseMap, REF_METADATA } from './spectral';
import { IParsedResult } from './types';

export class Resolved {
  public refMap: Dictionary<string>;
  public resolved: unknown;
  public unresolved: unknown;
  public errors: IResolveError[];
  public format?: string | null;

  constructor(public spec: IParsedResult, resolveResult: IResolveResult, public parsedMap: IParseMap) {
    this.refMap = resolveResult.refMap;
    this.resolved = resolveResult.result;
    this.unresolved = spec.parsed.data;
    this.errors = resolveResult.errors;
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

    if (target && target[REF_METADATA]) {
      return {
        path: [...get(target, [REF_METADATA, 'root'], []), ...newPath],
        doc: get(this.parsedMap.parsed, get(target, [REF_METADATA, 'ref']), this.spec),
      };
    }

    return {
      path,
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
