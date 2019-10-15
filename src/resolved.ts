import { decodePointerFragment } from '@stoplight/json';
import { IGraphNodeData, IResolveError } from '@stoplight/json-ref-resolver/types';
import { Dictionary, ILocation, IRange, JsonPath, Segment } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
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
  public readonly graph: DepGraph<IGraphNodeData>;
  public readonly resolved: unknown;
  public readonly unresolved: unknown;
  public readonly errors: IResolveError[];
  public formats?: string[] | null;

  constructor(public spec: IParsedResult, resolveResult: ResolveResult, public parsedMap: IParseMap) {
    this.unresolved = spec.parsed.data;
    this.formats = spec.formats;

    this.refMap = resolveResult.refMap;
    this.graph = resolveResult.graph;
    this.resolved = resolveResult.result;
    this.errors = resolveResult.errors;
  }

  // this method detects whether given json path points to a place in original unresolved document
  public doesBelongToSourceDoc(path: JsonPath): boolean {
    if (path.length === 0) {
      // todo: each rule and their function should be context-aware, meaning they should aware of the fact they operate on resolved content
      // let's assume the error was reported correctly by any custom rule /shrug
      return true;
    }

    let piece = this.unresolved;

    for (const segment of path) {
      if (!isObject(piece)) return false;

      if (segment in piece) {
        piece = piece[segment];
      } else if (hasRef(piece)) {
        if (this.spec.source === void 0) return false;
        let nodeData;
        try {
          nodeData = this.graph.getNodeData(this.spec.source);
        } catch {
          return false;
        }

        const { refMap } = nodeData;
        let { $ref } = piece;

        while ($ref in refMap) {
          $ref = refMap[$ref];
        }

        return (
          $ref.length === 0 ||
          $ref[0] === '#' ||
          $ref.slice(0, Math.max(0, Math.min($ref.length, $ref.indexOf('#')))) === this.spec.source
        );
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

    if (!this.doesBelongToSourceDoc(path)) {
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

  public getValueForJsonPath(path: JsonPath): unknown {
    const parsedResult = this.getParsedForJsonPath(path);
    return parsedResult === null ? void 0 : get(parsedResult.doc.parsed.data, parsedResult.path);
  }
}
