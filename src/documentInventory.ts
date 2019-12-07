import { extractSourceFromRef, hasRef, isLocalRef } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { ICache, IGraphNodeData, IUriParser } from '@stoplight/json-ref-resolver/types';
import { extname, resolve } from '@stoplight/path';
import { Dictionary, IParserResult, JsonPath } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
import { get } from 'lodash';
import { Document } from './document';

import { formatParserDiagnostics, formatResolverErrors } from './errorMessages';
import * as Parsers from './parsers';
import { IParser } from './parsers/types';
import { IResolver, IRuleResult } from './types';
import { getClosestJsonPath, getEndRef, isAbsoluteRef, safePointerToPath, traverseObjUntilRef } from './utils';

export type DocumentInventoryItem = {
  document: Document;
  path: JsonPath;
  missingPropertyPath: JsonPath;
};

export class DocumentInventory {
  private static readonly _cachedRemoteDocuments = new WeakMap<ICache | IResolver, Dictionary<Document>>();

  public graph!: DepGraph<IGraphNodeData>;
  public resolved: unknown;
  public errors!: IRuleResult[];
  public diagnostics: IRuleResult[] = [];

  public readonly referencedDocuments: Dictionary<Document>;

  public get source() {
    return this.document.source;
  }

  public get unresolved() {
    return this.document.data;
  }

  public get formats() {
    return this.document.formats;
  }

  constructor(public readonly document: Document<unknown>, protected resolver: IResolver) {
    const cacheKey = resolver instanceof Resolver ? resolver.uriCache : resolver;
    const cachedDocuments = DocumentInventory._cachedRemoteDocuments.get(cacheKey);
    if (cachedDocuments) {
      this.referencedDocuments = cachedDocuments;
    } else {
      this.referencedDocuments = {};
      DocumentInventory._cachedRemoteDocuments.set(cacheKey, this.referencedDocuments);
    }
  }

  public async resolve() {
    const resolveResult = await this.resolver.resolve(this.document.data, {
      baseUri: this.document.source,
      parseResolveResult: this.parseResolveResult,
    });

    this.graph = resolveResult.graph;
    this.resolved = resolveResult.result;
    this.errors = formatResolverErrors(this.document, resolveResult.errors);
  }

  public findAssociatedItemForPath(path: JsonPath): DocumentInventoryItem | null {
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

      while (true) {
        if (source === void 0) return null;

        $ref = getEndRef(this.graph.getNodeData(source).refMap, $ref);

        if ($ref === null) return null;

        const scopedPath = [...safePointerToPath($ref), ...newPath];
        let resolvedDoc;

        if (isLocalRef($ref)) {
          resolvedDoc = source === this.document.source ? this.document : this.referencedDocuments[source];
        } else {
          const extractedSource = extractSourceFromRef($ref)!;
          source = isAbsoluteRef(extractedSource) ? extractedSource : resolve(source, '..', extractedSource);

          resolvedDoc = source === this.document.source ? this.document : this.referencedDocuments[source];
          const obj =
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

  protected parseResolveResult = async (resolveOpts: IUriParser) => {
    const source = resolveOpts.targetAuthority.href().replace(/\/$/, '');
    const ext = extname(source);

    const content = String(resolveOpts.result);
    const parser: IParser<IParserResult<unknown, any, any, any>> = ext === '.json' ? Parsers.Json : Parsers.Yaml;
    const document = new Document(content, parser, source);

    resolveOpts.result = document.data;
    if (document.diagnostics.length > 0) {
      this.diagnostics.push(...formatParserDiagnostics(document.diagnostics, document.source));
    }

    this.referencedDocuments[source] = document;

    return resolveOpts;
  };
}
