import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { Formatter } from './types';

const OUTPUT_TYPES: Dictionary<string, DiagnosticSeverity> = {
  [DiagnosticSeverity.Error]: 'error',
  [DiagnosticSeverity.Warning]: 'warning',
  [DiagnosticSeverity.Information]: 'notice',
  [DiagnosticSeverity.Hint]: 'notice',
};

type OutputParams = {
  title?: string;
  file: string;
  col?: number;
  endColumn?: number;
  line?: number;
  endLine?: number;
};

export const githubActions: Formatter = results => {
  return results
    .map(result => {
      const params: OutputParams = {
        title: result.code.toString(),
        file: require('path').relative(process.cwd(), result.source ?? ''),
        col: result.range.start.character,
        endColumn: result.range.end.character,
        line: result.range.start.line,
        endLine: result.range.end.line,
      };

      const paramsString = Object.entries(params)
        .map(p => p.join('='))
        .join(',');

      return `::${OUTPUT_TYPES[result.severity]} ${paramsString}::${result.message}`;
    })
    .join('\n');
};
