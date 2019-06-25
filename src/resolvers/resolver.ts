import { Resolver } from '@stoplight/json-ref-resolver';
import { IResolverOpts, IUriParser } from '@stoplight/json-ref-resolver/types';
import { Dictionary } from '@stoplight/types';
import { set } from 'lodash';
import { IParsedResult } from '../types';
import { ANNOTATION } from './http-and-file';

export interface IParseMap {
  refs: Dictionary<object>;
  parsed: Dictionary<IParsedResult>;
  pointers: Dictionary<string[]>;
}

type ParsedProcessor = (parsed: IParsedResult, opts: IUriParser) => void;

export class SpectralResolver extends Resolver {
  public parsedMap: IParseMap;

  constructor(opts?: (map: ParsedProcessor) => IResolverOpts) {
    const parsedMap: IParseMap = {
      refs: {},
      parsed: {},
      pointers: {},
    };

    super(opts && opts(SpectralResolver.processor(parsedMap)));
    this.parsedMap = parsedMap;
  }

  private static processor(parsedMap: IParseMap) {
    return (parsedResult: IParsedResult, opts: IUriParser) => {
      const ref = opts.targetAuthority.toString();
      parsedMap.parsed[ref] = parsedResult;
      parsedMap.pointers[ref] = opts.parentPath;
      const parentRef = opts.parentAuthority.toString();

      set(
        parsedMap.refs,
        [...(parsedMap.pointers[parentRef] ? parsedMap.pointers[parentRef] : []), ...opts.parentPath],
        Object.defineProperty({}, ANNOTATION, {
          enumerable: false,
          writable: false,
          value: {
            ref,
            root: opts.fragment.split('/').slice(1),
          },
        }),
      );
    };
  }
}
