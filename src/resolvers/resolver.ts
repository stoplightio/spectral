import { Resolver } from '@stoplight/json-ref-resolver';
import { IResolverOpts } from '@stoplight/json-ref-resolver/types';
import { Dictionary } from '@stoplight/types/dist';
import { IParsedResult } from '../types';

export interface IParseMap {
  refs: Dictionary<object>;
  parsed: Dictionary<IParsedResult>;
  parent: Dictionary<string[]>;
}

export class SpectralResolver extends Resolver {
  public parsedMap: IParseMap;

  constructor(opts?: (map: IParseMap) => IResolverOpts) {
    const parsedMap: IParseMap = {
      refs: {},
      parsed: {},
      parent: {},
    };
    super(opts && opts(parsedMap));
    this.parsedMap = parsedMap;
  }
}
