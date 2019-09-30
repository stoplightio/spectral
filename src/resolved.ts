import { decodePointerFragment, pointerToPath } from '@stoplight/json';
import { IResolveError } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, IRange, JsonPath, Segment } from '@stoplight/types';
import { get } from 'lodash';
import { IParseMap, REF_METADATA, ResolveResult } from './spectral';
import { IParsedResult } from './types';
import { hasRef, isObject } from './utils';

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

  public doesBelongToDoc(path: JsonPath): boolean {
    if (path.length === 0) {
      // todo: each rule and their function should be context-aware, meaning they should aware of the fact they operate on resolved content
      // let's assume the error was reported correctly by any custom rule /shrug
      return true;
    }

    let piece = this.unresolved;

    for (let i = 0; i < path.length; i++) {
      if (!isObject(piece)) return false;

      if (path[i] in piece) {
        piece = piece[path[i]];
      } else if (hasRef(piece)) {
        return this.doesBelongToDoc([...pointerToPath(piece.$ref), ...path.slice(i)]);
      }
    }

    return true;
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
        path: [...get(target, [REF_METADATA, 'root'], []).map(decodePointerFragment), ...newPath],
        doc: get(this.parsedMap.parsed, get(target, [REF_METADATA, 'ref']), this.spec),
      };
    }

    if (!this.doesBelongToDoc(path)) {
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
