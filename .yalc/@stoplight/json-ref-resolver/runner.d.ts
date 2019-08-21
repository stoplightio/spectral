/// <reference types="urijs" />
import * as Types from './types';
export declare const defaultGetRef: (key: string, val: any) => any;
export declare class ResolveRunner implements Types.IResolveRunner {
  public readonly id: number;
  public readonly baseUri: uri.URI;
  public readonly uriCache: Types.ICache;
  public depth: number;
  public uriStack: string[];
  public readonly dereferenceInline: boolean;
  public readonly dereferenceRemote: boolean;
  public ctx: any;
  public readonly resolvers: {
    [scheme: string]: Types.IResolver;
  };
  public readonly getRef: (key: string, val: any, opts: Types.IComputeRefOpts) => string | void;
  public readonly transformRef?: (opts: Types.IRefTransformer, ctx: any) => uri.URI | any;
  public readonly parseResolveResult?: (opts: Types.IUriParser) => Promise<Types.IUriParserResult>;
  public readonly transformDereferenceResult?: (
    opts: Types.IDereferenceTransformer,
  ) => Promise<Types.ITransformerResult>;
  private _source;
  constructor(source: any, opts?: Types.IResolveRunnerOpts);
  public readonly source: any;
  public resolve(jsonPointer?: string, opts?: Types.IResolveOpts): Promise<Types.IResolveResult>;
  public computeRef: (opts: Types.IComputeRefOpts) => void | uri.URI;
  public atMaxUriDepth: () => boolean;
  public lookupUri: (
    opts: {
      fragment: string;
      ref: uri.URI;
      cacheKey: string;
      parentPath: string[];
    },
  ) => Promise<ResolveRunner>;
  public lookupAndResolveUri: (opts: Types.IRefHandlerOpts) => Promise<Types.IUriResult>;
  public _cacheKeySerializer(sOpts: any): any;
  private computeUriCacheKey;
  private isFile;
}
