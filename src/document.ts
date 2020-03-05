import { normalize } from '@stoplight/path';
import { DeepReadonly, GetLocationForJsonPath, IParserResult, IRange, JsonPath, Optional } from '@stoplight/types';
import { isObjectLike } from 'lodash';
import { formatParserDiagnostics } from './errorMessages';
import { IParser } from './parsers/types';
import { IRuleResult } from './types';
import { startsWithProtocol } from './utils';

export const StdIn: string = '<STDIN>';

export interface IDocument<D = unknown> {
  readonly source: string | null;
  readonly diagnostics: ReadonlyArray<IRuleResult>;
  formats?: string[] | null;
  getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange>;
  data: D;
}

const normalizeSource = (source: Optional<string>): string | null => {
  if (source === void 0) return null;
  return source && !startsWithProtocol(source) ? normalize(source) : source;
};

export class Document<D = unknown, R extends IParserResult = IParserResult<D>> implements IDocument<D> {
  protected readonly parserResult: R;
  public readonly source: string | null;
  public readonly diagnostics: ReadonlyArray<IRuleResult>;
  public formats?: string[] | null;

  constructor(protected readonly input: string, protected readonly parser: IParser<R>, source?: string) {
    this.parserResult = parser.parse(input);
    // we need to normalize the path in case path with forward slashes is given
    this.source = normalizeSource(source);
    this.diagnostics = formatParserDiagnostics(this.parserResult.diagnostics, this.source);
  }

  public getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange> {
    return this.parser.getLocationForJsonPath(this.parserResult, path, closest)?.range;
  }

  public static get DEFAULT_RANGE(): DeepReadonly<IRange> {
    return {
      start: {
        character: 0,
        line: 0,
      },
      end: {
        character: 0,
        line: 0,
      },
    };
  }

  public get data() {
    return this.parserResult.data;
  }
}

export class ParsedDocument<D = unknown, R extends IParsedResult = IParsedResult> implements IDocument<D> {
  public readonly source: string | null;
  public readonly diagnostics: ReadonlyArray<IRuleResult>;
  public formats?: string[] | null;

  constructor(protected readonly parserResult: R, source?: string) {
    // we need to normalize the path in case path with forward slashes is given
    this.source = normalizeSource(source);
    this.diagnostics = formatParserDiagnostics(this.parserResult.parsed.diagnostics, this.source);
  }

  public getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange> {
    return this.parserResult.getLocationForJsonPath(this.parserResult.parsed, path, closest)?.range;
  }

  public get data() {
    return this.parserResult.parsed.data;
  }
}

export interface IParsedResult<R extends IParserResult = IParserResult<unknown, any, any, any>> {
  parsed: IParserResult;
  getLocationForJsonPath: GetLocationForJsonPath<R>;
  source?: string;
  formats?: string[];
}

export const isParsedResult = (obj: any): obj is IParsedResult =>
  isObjectLike(obj?.parsed) && typeof obj.getLocationForJsonPath === 'function';
