import { Resolver } from '@stoplight/json-ref-resolver';
import { IResolverOpts } from '@stoplight/json-ref-resolver/types';
import { Dictionary } from '@stoplight/types/dist';
import { IParsedResult } from '../types';

export class SpectralResolver extends Resolver {
  public parsedMap: Dictionary<IParsedResult>;

  constructor(opts: (map: Dictionary<IParsedResult>) => IResolverOpts) {
    const parsedMap: Dictionary<IParsedResult> = {};
    super(opts(parsedMap));
    this.parsedMap = parsedMap;
  }
}
