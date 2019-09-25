import { IResolveError } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, IRange, JsonPath, Segment } from '@stoplight/types';
import { get, has } from 'lodash';
import { IParseMap, REF_METADATA, ResolveResult } from './spectral';
import { IParsedResult } from './types';

const getDefaultRange = (): IRange => ({
  start: {
    line: 0,
    character: 0,
  },
  end: {
    line: 0,
    character: 0,
  },
});

export class Resolved {
  public readonly refMap: Dictionary<string>;
  public readonly resolved: unknown;
  public readonly unresolved: unknown;
  public readonly errors: IResolveError[];
  public formats?: string[] | null;

  constructor(public spec: IParsedResult, resolveResult: ResolveResult, public parsedMap: IParseMap) {
    this.unresolved = spec.parsed.data;
    this.formats = spec.formats;

    this.refMap = resolveResult.refMap;
    this.resolved = resolveResult.result;
    this.errors = resolveResult.errors;
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

    if (path.length > 0 && !has(this.spec.parsed.data, path)) {
      return null;
    }

    return {
      path,
      doc: this.spec,
    };
  }

  public getLocationForJsonPath(path: JsonPath, closest?: boolean): ILocation {
    const parsedResult = this.getParsedForJsonPath(path);
    if (parsedResult === null) {
      return {
        range: getDefaultRange(),
      };
    }

    const location = parsedResult.doc.getLocationForJsonPath(parsedResult.doc.parsed, parsedResult.path, closest);

    return {
      ...(parsedResult.doc.source && { uri: parsedResult.doc.source }),
      range: location !== void 0 ? location.range : getDefaultRange(),
    };
  }
}
