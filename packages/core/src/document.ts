import { normalize } from '@stoplight/path';
import { DeepReadonly, GetLocationForJsonPath, IParserResult, IRange, JsonPath, Optional } from '@stoplight/types';
import { formatParserDiagnostics } from './errorMessages';
import { startsWithProtocol } from '@stoplight/spectral-runtime';
import { isPlainObject } from '@stoplight/json';
import { IParser } from '@stoplight/spectral-parsers';
import { IRuleResult } from './types';
import { Format } from './ruleset/format';

export interface IDocument<D = unknown> {
  readonly source: string | null;
  readonly diagnostics: ReadonlyArray<IRuleResult>;
  formats?: Set<Format> | null;
  getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange>;
  trapAccess<T extends Record<string, unknown> = Record<string, unknown>>(obj: T): T;
  data: D;
}

export function normalizeSource(source: undefined): null;
export function normalizeSource(source: string): string;
export function normalizeSource(source: Optional<string>): string | null;
export function normalizeSource(source: Optional<string>): string | null {
  if (source === void 0) return null;
  return source.length > 0 && !startsWithProtocol(source) ? normalize(source) : source;
}

export class Document<D = unknown, R extends IParserResult<D> = IParserResult<D>> implements IDocument<D> {
  protected readonly parserResult: R;
  public readonly source: string | null;
  public readonly diagnostics: IRuleResult[];
  public formats?: Set<Format> | null;

  constructor(protected readonly input: string, protected readonly parser: IParser<R>, source?: string) {
    this.parserResult = parser.parse(input);
    // we need to normalize the path in case path with forward slashes is given
    this.source = normalizeSource(source);
    this.diagnostics = formatParserDiagnostics(this.parserResult.diagnostics, this.source);
  }

  public getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange> {
    return this.parser.getLocationForJsonPath(this.parserResult, path, closest)?.range;
  }

  public trapAccess<T extends Record<string, unknown> = Record<string, unknown>>(obj: T): T {
    return this.parser.trapAccess<T>(obj);
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

  public get data(): D {
    return this.parserResult.data;
  }
}

export class ParsedDocument<D = unknown, R extends IParsedResult<D> = IParsedResult<D>> implements IDocument<D> {
  public readonly source: string | null;
  public readonly diagnostics: IRuleResult[];
  public formats?: Set<Format> | null;

  constructor(protected readonly parserResult: R) {
    // we need to normalize the path in case path with forward slashes is given
    this.source = normalizeSource(parserResult.source);
    this.diagnostics = formatParserDiagnostics(this.parserResult.parsed.diagnostics, this.source);
  }

  public trapAccess<T extends Record<string, unknown> = Record<string, unknown>>(obj: T): T {
    return obj;
  }

  public getRangeForJsonPath(path: JsonPath, closest?: boolean): Optional<IRange> {
    return this.parserResult.getLocationForJsonPath(this.parserResult.parsed, path, closest)?.range;
  }

  public get data(): D {
    return this.parserResult.parsed.data;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IParsedResult<D = unknown, R extends IParserResult<D> = IParserResult<D, any, any, any>> {
  parsed: R;
  getLocationForJsonPath: GetLocationForJsonPath<R>;
  source?: string;
  formats?: string[];
}

export const isParsedResult = (obj: unknown): obj is IParsedResult =>
  isPlainObject(obj) && isPlainObject(obj.parsed) && typeof obj.getLocationForJsonPath === 'function';
