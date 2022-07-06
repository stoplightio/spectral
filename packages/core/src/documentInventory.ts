import { extractSourceFromRef, isLocalRef } from '@stoplight/json';
import { extname, resolve } from '@stoplight/path';
import { Dictionary, IParserResult, JsonPath } from '@stoplight/types';
import { isObjectLike } from 'lodash';
import { Document, IDocument } from './document';
import { Resolver, ResolveResult } from '@stoplight/spectral-ref-resolver';

import { formatParserDiagnostics, formatResolverErrors } from './errorMessages';
import * as Parsers from '@stoplight/spectral-parsers';
import { IRuleResult } from './types';
import { getClosestJsonPath, isAbsoluteRef, traverseObjUntilRef } from '@stoplight/spectral-runtime';
import { Format } from './ruleset/format';

export type DocumentInventoryItem = {
  document: IDocument;
  path: JsonPath;
  missingPropertyPath: JsonPath;
};

export interface IDocumentInventory {
  readonly graph: ResolveResult['graph'] | null;
  readonly referencedDocuments: Dictionary<IDocument>;
  findAssociatedItemForPath(path: JsonPath, resolved: boolean): DocumentInventoryItem | null;
}

export class DocumentInventory implements IDocumentInventory {
  private static readonly _cachedRemoteDocuments = new WeakMap<Resolver['uriCache'], Dictionary<IDocument>>();

  public graph: ResolveResult['graph'] | null;
  public resolved: unknown;
  public errors: IRuleResult[] | null;
  public diagnostics: IRuleResult[] = [];

  public readonly referencedDocuments: Dictionary<IDocument>;

  public get source(): string | null {
    return this.document.source;
  }

  public get unresolved(): unknown {
    return this.document.data;
  }

  public get formats(): Set<Format> | null {
    return this.document.formats ?? null;
  }

  constructor(public readonly document: IDocument, protected resolver: Resolver) {
    this.graph = null;
    this.errors = null;

    const cacheKey = resolver.uriCache;
    const cachedDocuments = DocumentInventory._cachedRemoteDocuments.get(cacheKey);
    if (cachedDocuments !== void 0) {
      this.referencedDocuments = cachedDocuments;
    } else {
      this.referencedDocuments = {};
      DocumentInventory._cachedRemoteDocuments.set(cacheKey, this.referencedDocuments);
    }
  }

  public async resolve(): Promise<void> {
    if (!isObjectLike(this.document.data)) {
      this.graph = null;
      this.resolved = this.document.data;
      this.errors = null;
      return;
    }

    const resolveResult = await this.resolver.resolve(this.document.data, {
      ...(this.document.source !== null ? { baseUri: this.document.source } : null),
      parseResolveResult: this.parseResolveResult,
    });

    this.graph = resolveResult.graph;
    this.resolved = resolveResult.result;
    this.errors = formatResolverErrors(this.document, resolveResult.errors);
  }

  public findAssociatedItemForPath(path: JsonPath, resolved: boolean): DocumentInventoryItem | null {
    if (!resolved) {
      const newPath: JsonPath = getClosestJsonPath(this.unresolved, path);
      const item: DocumentInventoryItem = {
        document: this.document,
        path: newPath,
        missingPropertyPath: path,
      };
      return item;
    }

    try {
      const newPath: JsonPath = getClosestJsonPath(this.resolved, path);
      const $ref = traverseObjUntilRef(this.unresolved, newPath);

      if ($ref === null) {
        const item: DocumentInventoryItem = {
          document: this.document,
          path: getClosestJsonPath(this.unresolved, path),
          missingPropertyPath: path,
        };
        return item;
      }

      const missingPropertyPath =
        newPath.length === 0 ? [] : path.slice(path.lastIndexOf(newPath[newPath.length - 1]) + 1);

      let { source } = this;
      if (source === null || this.graph === null) {
        return null;
      }

      let refMap = this.graph.getNodeData(source).refMap;
      let resolvedDoc = this.document;

      // Add '#' on the beginning of "path" to simplify the logic below.
      const adjustedPath: JsonPath = [...'#', ...path];

      // Walk through the segments of 'path' one at a time, looking for
      // json path locations containing a $ref.
      let refMapKey = '';
      for (const segment of adjustedPath) {
        if (refMapKey.length) {
          refMapKey = refMapKey.concat('/');
        }
        refMapKey = refMapKey.concat(segment.toString().replace(/\//g, '~1'));

        // If our current refMapKey value is in fact a key in refMap,
        // then we'll "reverse-resolve" it by replacing refMapKey with
        // the actual value of that key within refMap.
        // It's possible that we have a "ref to a ref", so we'll do this
        // "reverse-resolve" step in a while loop.
        while (refMapKey in refMap) {
          const newRef = refMap[refMapKey];
          if (isLocalRef(newRef)) {
            refMapKey = newRef;
          } else {
            const extractedSource = extractSourceFromRef(newRef);
            if (extractedSource === null) {
              const item: DocumentInventoryItem = {
                document: resolvedDoc,
                path: getClosestJsonPath(resolvedDoc.data, path),
                missingPropertyPath: path,
              };
              return item;
            }

            // Update 'source' to reflect the filename within the external ref.
            source = isAbsoluteRef(extractedSource) ? extractedSource : resolve(source, '..', extractedSource);

            // Update "resolvedDoc" to reflect the new "source" value and make sure we found an actual document.
            const newResolvedDoc = source === this.document.source ? this.document : this.referencedDocuments[source];
            if (newResolvedDoc === null || newResolvedDoc === undefined) {
              const item: DocumentInventoryItem = {
                document: resolvedDoc,
                path: getClosestJsonPath(resolvedDoc.data, path),
                missingPropertyPath: path,
              };
              return item;
            }
            resolvedDoc = newResolvedDoc;

            // Update "refMap" to reflect the new "source" value.
            refMap = this.graph.getNodeData(source).refMap;

            refMapKey = newRef.indexOf('#') >= 0 ? newRef.slice(newRef.indexOf('#')) : '#';
          }
        }
      }

      const closestPath = getClosestJsonPath(resolvedDoc.data, this.convertRefMapKeyToPath(refMapKey));
      const item: DocumentInventoryItem = {
        document: resolvedDoc,
        path: closestPath,
        missingPropertyPath: [...closestPath, ...missingPropertyPath],
      };
      return item;
    } catch (e) {
      // console.warn(`Caught exception! e=${e}`);
      return null;
    }
  }

  protected convertRefMapKeyToPath(refPath: string): JsonPath {
    const jsonPath: JsonPath = [];

    if (refPath.startsWith('#/')) {
      refPath = refPath.slice(2);
    }

    const pathSegments: string[] = refPath.split('/');
    for (const pathSegment of pathSegments) {
      jsonPath.push(pathSegment.replace('~1', '/'));
    }

    return jsonPath;
  }

  protected parseResolveResult: Resolver['parseResolveResult'] = resolveOpts => {
    const source = resolveOpts.targetAuthority.href().replace(/\/$/, '');
    const ext = extname(source);

    const content = String(resolveOpts.result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parser: Parsers.IParser<IParserResult<unknown, any, any, any>> =
      ext === '.json' ? Parsers.Json : Parsers.Yaml;
    const document = new Document(content, parser, source);

    resolveOpts.result = document.data;
    if (document.diagnostics.length > 0) {
      this.diagnostics.push(...formatParserDiagnostics(document.diagnostics, document.source));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.referencedDocuments[source] = document;

    return Promise.resolve(resolveOpts);
  };
}
