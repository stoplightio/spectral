import * as Types from './types';
export declare class Cache implements Types.ICache {
  private _stats;
  private readonly _stdTTL;
  private _data;
  constructor(opts?: Types.ICacheOpts);
  public readonly stats: {
    hits: number;
    misses: number;
  };
  public get(key: string): any;
  public set(key: string, val: any): void;
  public has(key: string): boolean;
}
