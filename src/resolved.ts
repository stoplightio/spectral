import { IResolveError, IResolveResult, IResolveRunner } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, JsonPath } from '@stoplight/types';
import { Segment } from '@stoplight/types/dist';
import { get } from 'lodash';
import { ANNOTATION } from './resolvers/http-and-file';
import { SpectralResolver } from './resolvers/resolver';
import { IParsedResult } from './types';

export class Resolved implements IResolveResult {
  public refMap: Dictionary<string>;
  public result: unknown;
  public errors: IResolveError[];
  public runner: IResolveRunner;

  constructor(public spec: IParsedResult, result: IResolveResult, public resolver: SpectralResolver) {
    this.refMap = result.refMap;
    this.result = result.result;
    this.errors = result.errors;
    this.runner = result.runner;
  }

  public getParsedForJsonPath(path: JsonPath) {
    let target = this.resolver.parsedMap.refs;
    const newPath = [...path];
    let segment: Segment;

    while (newPath.length > 0) {
      segment = newPath.shift()!;
      if (segment && segment in target) {
        target = target[segment] as any;
      } else {
        newPath.unshift(segment);
        break;
      }
    }

    if (target) {
      return {
        path: [...get(target, [ANNOTATION, 'root'], []), ...newPath],
        doc: get(this.resolver.parsedMap.parsed, get(target, [ANNOTATION, 'ref']), this.spec),
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
