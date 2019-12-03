import { pointerToPath } from '@stoplight/json';
import { IGraphNodeData, IResolveError } from '@stoplight/json-ref-resolver/types';
import { normalize, resolve } from '@stoplight/path';
import { Dictionary, ILocation, IRange, JsonPath } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
import { get } from 'lodash';
import { IParsedResult, ResolveResult } from './types';
import {
  extractSourceFromRef,
  getEndRef,
  hasRef,
  isAbsoluteRef,
  isLocalRef,
  safePointerToPath,
  traverseObjUntilRef,
} from './utils';

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

  public get source() {
    return this.parsed.source ? normalize(this.parsed.source) : this.parsed.source;
  }

  constructor(
    protected parsed: IParsedResult,
    resolveResult: ResolveResult,
    public parsedRefs: Dictionary<IParsedResult>,
  ) {
    this.unresolved = parsed.parsed.data;
    this.formats = parsed.formats;

    this.refMap = resolveResult.refMap;
    this.graph = resolveResult.graph;
    this.resolved = resolveResult.result;
    this.errors = resolveResult.errors;
  }

  public getParsedForJsonPath(path: JsonPath) {
    try {
      const newPath: JsonPath = [...path];
      let $ref = traverseObjUntilRef(this.unresolved, newPath);

      if ($ref === null) {
        return {
          path,
          doc: this.parsed,
        };
      }

      let { source } = this;

      while (true) {
        if (source === void 0) return null;

        $ref = getEndRef(this.graph.getNodeData(source).refMap, $ref);

        if ($ref === null) return null;

        if (isLocalRef($ref)) {
          return {
            path: pointerToPath($ref),
            doc: source === this.parsed.source ? this.parsed : this.parsedRefs[source],
          };
        }

        const extractedSource = extractSourceFromRef($ref)!;
        source = isAbsoluteRef(extractedSource) ? extractedSource : resolve(source, '..', extractedSource);

        const doc = source === this.parsed.source ? this.parsed : this.parsedRefs[source];
        const { parsed } = doc;
        const scopedPath = [...safePointerToPath($ref), ...newPath];

        const obj = scopedPath.length === 0 || hasRef(parsed.data) ? parsed.data : get(parsed.data, scopedPath);

        if (hasRef(obj)) {
          $ref = obj.$ref;
        } else {
          return {
            doc,
            path: scopedPath,
          };
        }
      }
    } catch {
      return null;
    }
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
      range: location?.range || getDefaultRange(),
    };
  }

  public getValueForJsonPath(path: JsonPath): unknown {
    const parsedResult = this.getParsedForJsonPath(path);
    return parsedResult === null ? void 0 : get(parsedResult.doc.parsed.data, parsedResult.path);
  }
}
