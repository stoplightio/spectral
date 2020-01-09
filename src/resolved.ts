import { extractSourceFromRef, hasRef, isLocalRef } from '@stoplight/json';
import { IGraphNodeData, IResolveError } from '@stoplight/json-ref-resolver/types';
import { normalize, resolve } from '@stoplight/path';
import { Dictionary, ILocation, IRange, JsonPath } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
import { get } from 'lodash';
import { IParsedResult, ResolveResult } from './types';
import { getClosestJsonPath, getEndRef, isAbsoluteRef, safePointerToPath, traverseObjUntilRef } from './utils';

export const getDefaultRange = (): IRange => ({
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
    public readonly parsed: IParsedResult,
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

  public getParsedForJsonPath(path: JsonPath, resolved: boolean) {
    if (!resolved) {
      const newPath: JsonPath = getClosestJsonPath(this.unresolved, path);

      return {
        path: newPath,
        doc: this.parsed,
        missingPropertyPath: path,
      };
    }

    try {
      const newPath: JsonPath = getClosestJsonPath(this.resolved, path);
      let $ref = traverseObjUntilRef(this.unresolved, newPath);

      if ($ref === null) {
        return {
          path: getClosestJsonPath(this.unresolved, path),
          doc: this.parsed,
          missingPropertyPath: path,
        };
      }

      const missingPropertyPath =
        newPath.length === 0 ? [] : path.slice(path.lastIndexOf(newPath[newPath.length - 1]) + 1);

      let { source } = this;

      while (true) {
        if (source === void 0) return null;

        $ref = getEndRef(this.graph.getNodeData(source).refMap, $ref);

        if ($ref === null) return null;

        const scopedPath = [...safePointerToPath($ref), ...newPath];
        let resolvedDoc;

        if (isLocalRef($ref)) {
          resolvedDoc = source === this.parsed.source ? this.parsed : this.parsedRefs[source];
        } else {
          const extractedSource = extractSourceFromRef($ref)!;
          source = isAbsoluteRef(extractedSource) ? extractedSource : resolve(source, '..', extractedSource);

          resolvedDoc = source === this.parsed.source ? this.parsed : this.parsedRefs[source];
          const { parsed } = resolvedDoc;

          const obj = scopedPath.length === 0 || hasRef(parsed.data) ? parsed.data : get(parsed.data, scopedPath);

          if (hasRef(obj)) {
            $ref = obj.$ref;
            continue;
          }
        }

        const closestPath = getClosestJsonPath(resolvedDoc.parsed.data, scopedPath);
        return {
          doc: resolvedDoc,
          path: closestPath,
          missingPropertyPath: [...closestPath, ...missingPropertyPath],
        };
      }
    } catch {
      return null;
    }
  }

  public getLocationForJsonPath(path: JsonPath, resolved: boolean): ILocation {
    const parsedResult = this.getParsedForJsonPath(path, resolved);
    if (parsedResult === null) {
      return {
        range: getDefaultRange(),
      };
    }

    const location = parsedResult.doc.getLocationForJsonPath(parsedResult.doc.parsed, parsedResult.path, true);

    return {
      ...(parsedResult.doc.source && { uri: parsedResult.doc.source }),
      range: location?.range || getDefaultRange(),
    };
  }
}
