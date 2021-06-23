import { extractSourceFromRef, hasRef, isLocalRef } from '@stoplight/json';
import { extname, resolve } from '@stoplight/path';
import { Dictionary, IParserResult, JsonPath } from '@stoplight/types';
import { get, isObjectLike } from 'lodash';
import { Document, IDocument } from './document';
import { Resolver, ResolveResult } from '@stoplight/spectral-ref-resolver';

import { formatParserDiagnostics, formatResolverErrors } from './errorMessages';
import * as Parsers from '@stoplight/spectral-parsers';
import { IRuleResult } from './types';
import {
  getClosestJsonPath,
  getEndRef,
  isAbsoluteRef,
  safePointerToPath,
  traverseObjUntilRef,
} from '@stoplight/spectral-runtime';
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

      return {
        document: this.document,
        path: newPath,
        missingPropertyPath: path,
      };
    }

    try {
      const newPath: JsonPath = getClosestJsonPath(this.resolved, path);
      let $ref = traverseObjUntilRef(this.unresolved, newPath);

      if ($ref === null) {
        return {
          document: this.document,
          path: getClosestJsonPath(this.unresolved, path),
          missingPropertyPath: path,
        };
      }

      const missingPropertyPath =
        newPath.length === 0 ? [] : path.slice(path.lastIndexOf(newPath[newPath.length - 1]) + 1);

      let { source } = this;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (source === null || this.graph === null) return null;

        $ref = getEndRef(this.graph.getNodeData(source).refMap, $ref);

        if ($ref === null) return null;

        const scopedPath = [...safePointerToPath($ref), ...newPath];
        let resolvedDoc = this.document;

        if (isLocalRef($ref)) {
          resolvedDoc = source === this.document.source ? this.document : this.referencedDocuments[source];
        } else {
          const extractedSource = extractSourceFromRef($ref);

          if (extractedSource === null) {
            return {
              document: resolvedDoc,
              path: getClosestJsonPath(resolvedDoc.data, path),
              missingPropertyPath: path,
            };
          }

          source = isAbsoluteRef(extractedSource) ? extractedSource : resolve(source, '..', extractedSource);

          resolvedDoc = source === this.document.source ? this.document : this.referencedDocuments[source];
          const obj: unknown =
            scopedPath.length === 0 || hasRef(resolvedDoc.data) ? resolvedDoc.data : get(resolvedDoc.data, scopedPath);

          if (hasRef(obj)) {
            $ref = obj.$ref;
            continue;
          }
        }

        const closestPath = getClosestJsonPath(resolvedDoc.data, scopedPath);
        return {
          document: resolvedDoc,
          path: closestPath,
          missingPropertyPath: [...closestPath, ...missingPropertyPath],
        };
      }
    } catch {
      return null;
    }
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
