/// <reference types="urijs" />
import * as Types from './types';
export declare class Resolver {
  public readonly uriCache: Types.ICache;
  protected dereferenceInline: boolean;
  protected dereferenceRemote: boolean;
  protected ctx: any;
  protected resolvers: {
    [scheme: string]: Types.IResolver;
  };
  protected getRef?: (key: string, val: any) => string | void;
  protected transformRef?: (opts: Types.IRefTransformer, ctx: any) => uri.URI | any;
  protected parseResolveResult?: (opts: Types.IUriParser) => Promise<Types.IUriParserResult>;
  constructor(opts?: Types.IResolverOpts);
  public resolve(source: any, opts?: Types.IResolveOpts): Promise<Types.IResolveResult>;
}
