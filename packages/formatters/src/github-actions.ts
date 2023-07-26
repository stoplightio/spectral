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
        col: result.range.start.character + 1,
        endColumn: result.range.end.character + 1,
        line: result.range.start.line + 1,
        endLine: result.range.end.line + 1,
      };

      const paramsString = Object.entries(params)
        .map(p => p.join('='))
        .join(',');

      // As annotated messages must be one-line due to GitHub's limitation, replacing all LF to %0A here.
      // see: https://github.com/actions/toolkit/issues/193
      // FIXME: Use replaceAll instead after removing Node.js 14 support.
      const message = result.message.replace(/\n/g, '%0A');

      return `::${OUTPUT_TYPES[result.severity]} ${paramsString}::${message}`;
    })
    .join('\n');
};
