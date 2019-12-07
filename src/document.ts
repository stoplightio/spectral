import { normalize } from '@stoplight/path';
import { DeepReadonly, IParserResult, IRange, JsonPath, Optional } from '@stoplight/types';
import { formatParserDiagnostics } from './errorMessages';
import { IParser } from './parsers/types';
import { IRuleResult } from './types';
import { startsWithProtocol } from './utils';

export class Document<D = unknown, R extends IParserResult = IParserResult<D>> {
  public readonly parserResult: R;
  public readonly source: Optional<string>;
  public readonly diagnostics: ReadonlyArray<IRuleResult>;
  public formats?: string[] | null;

  constructor(protected readonly input: string, protected readonly parser: IParser<R>, source?: string) {
    this.parserResult = parser.parse(input);
    // we need to normalize the path in case path with forward slashes is given
    this.source = source && !startsWithProtocol(source) ? normalize(source) : source;
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
