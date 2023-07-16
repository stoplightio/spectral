import { relative } from '@stoplight/path';
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
      // GitHub Actions requires relative path for annotations, determining from working directory here
      const file = relative(process.cwd(), result.source ?? '');
      const params: OutputParams = {
        title: result.code.toString(),
        file,
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
