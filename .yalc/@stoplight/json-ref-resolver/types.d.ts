/// <reference types="urijs" />
import { Segment } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
export interface IResolverOpts {
  uriCache?: ICache;
  resolvers?: {
    [scheme: string]: IResolver;
  };
  getRef?: (key: string, val: any, opts: IComputeRefOpts) => string | void;
  transformRef?: (opts: IRefTransformer, ctx: any) => uri.URI | void;
  parseResolveResult?: (opts: IUriParser) => Promise<IUriParserResult>;
  transformDereferenceResult?: (opts: IDereferenceTransformer) => Promise<ITransformerResult>;
  dereferenceInline?: boolean;
  dereferenceRemote?: boolean;
  ctx?: any;
}
export interface IResolveOpts extends IResolverOpts {
  jsonPointer?: string;
  baseUri?: string;
}
export interface IResolveResult {
  result: any;
  refMap: {
    [source: string]: string;
  };
  errors: IResolveError[];
  runner: IResolveRunner;
}
export interface IResolver {
  resolve(ref: uri.URI, ctx: any): Promise<any>;
}
export interface IUriParser {
  result: any;
  fragment: string;
  uriResult: IUriResult;
  targetAuthority: uri.URI;
  parentAuthority: uri.URI;
  parentPath: string[];
}
export interface IUriParserResult {
  result?: any;
  error?: Error;
}
export interface IDereferenceTransformer {
  result: any;
  source: any;
  fragment: string;
  targetAuthority: uri.URI;
  parentAuthority: uri.URI;
  parentPath: string[];
}
export interface ITransformerResult {
  result?: any;
  error?: Error;
}
export interface IUriResult {
  pointerStack: string[];
  targetPath: string[];
  uri: uri.URI;
  resolved?: IResolveResult;
  error?: IResolveError;
}
export interface IComputeRefOpts {
  key?: any;
  val: any;
  pointerStack: string[];
  jsonPointer?: string;
}
export interface IRefTransformer extends IComputeRefOpts {
  ref?: uri.URI;
  uri: uri.URI;
}
export declare type ResolverErrorCode =
  | 'POINTER_MISSING'
  | 'RESOLVE_URI'
  | 'PARSE_URI'
  | 'RESOLVE_POINTER'
  | 'TRANSFORM_DEREFERENCED';
export interface IResolveError {
  code: ResolverErrorCode;
  message: string;
  path: Segment[];
  uri: uri.URI;
  uriStack: string[];
  pointerStack: string[];
}
export interface ICache {
  readonly stats: {
    hits: number;
    misses: number;
  };
  get(key: string): any;
  set(key: string, val: any): void;
  has(key: string): boolean;
}
export interface ICacheOpts {
  stdTTL?: number;
}
export interface IRefHandlerOpts {
  ref: uri.URI;
  val: any;
  pointerStack: string[];
  cacheKey: string;
  resolvingPointer?: string;
  parentPath: string[];
  parentPointer: string;
}
export interface IResolveOpts {
  parentPath?: string[];
  pointerStack?: string[];
}
export interface IResolveRunner {
  id: number;
  source: any;
  dereferenceInline: boolean;
  dereferenceRemote: boolean;
  uriCache: ICache;
  depth: number;
  atMaxUriDepth: () => boolean;
  resolve: (source: any, opts?: IResolveOpts) => Promise<IResolveResult>;
  computeRef: (opts: IComputeRefOpts) => uri.URI | void | undefined;
  lookupAndResolveUri: (opts: IRefHandlerOpts) => Promise<IUriResult>;
}
export interface IResolveRunnerOpts extends IResolveOpts {
  depth?: number;
  uriStack?: string[];
}
export interface ICrawler {
  jsonPointer?: string;
  pointerGraph: DepGraph<string>;
  pointerStemGraph: DepGraph<string>;
  computeGraph: (target: any, parentPath: string[], parentPointer: string, pointerStack: string[]) => void;
}
export interface ICrawlerResult {
  result: any;
  errors: IResolveError[];
}
