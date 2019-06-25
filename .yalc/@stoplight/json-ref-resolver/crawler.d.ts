import { DepGraph } from 'dependency-graph';
import * as Types from './types';
export declare class ResolveCrawler implements Types.ICrawler {
  public readonly resolvers: Array<Promise<Types.IUriResult>>;
  public jsonPointer?: string;
  public readonly pointerGraph: DepGraph<string>;
  public readonly pointerStemGraph: DepGraph<string>;
  private _runner;
  constructor(runner: Types.IResolveRunner, jsonPointer?: string);
  public computeGraph: (target: any, parentPath?: string[], parentPointer?: string, pointerStack?: string[]) => void;
  private _resolveRef;
}
