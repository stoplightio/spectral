import { printPath, PrintStyle } from '@stoplight/spectral-runtime';
import { Formatter, FormatterContext } from './types';
import { groupBySource } from './utils';
import { DiagnosticSeverity } from '@stoplight/types';
import markdownEscape from 'markdown-escape';
import { getRuleDocumentationUrl } from './utils/getDocumentationUrl';

export const markdown: Formatter = (results, { failSeverity }, ctx?: FormatterContext) => {
  const groupedResults = groupBySource(results);

  const lines: string[][] = [];
  for (const [source, validationResults] of Object.entries(groupedResults)) {
    validationResults.sort((a, b) => a.range.start.line - b.range.start.line);

    if (validationResults.length > 0) {
      const filteredValidationResults = validationResults.filter(result => result.severity <= failSeverity);

      for (const result of filteredValidationResults) {
        const ruleDocumentationUrl = getRuleDocumentationUrl(result.code, ctx);
        const codeWithOptionalLink =
          ruleDocumentationUrl != null
            ? `[${result.code.toString()}](${ruleDocumentationUrl})`
            : result.code.toString();
        const escapedPath = markdownEscape(printPath(result.path, PrintStyle.Dot));
        const escapedMessage = markdownEscape(result.message);
        const severityString = DiagnosticSeverity[result.severity];
        const start = `${result.range.start.line}:${result.range.start.character}`;
        const end = `${result.range.end.line}:${result.range.end.character}`;
        const escapedSource = markdownEscape(source);
        lines.push([codeWithOptionalLink, escapedPath, escapedMessage, severityString, start, end, escapedSource]);
      }
    }
  }

  const headers = ['Code', 'Path', 'Message', 'Severity', 'Start', 'End', 'Source'];
  return createMdTable(headers, lines);
};

function createMdTable(headers: string[], lines: string[][]): string {
  //find lenght of each column
  const columnLengths = headers.map((_, i) => Math.max(...lines.map(line => line[i].length), headers[i].length));

  let string = '';
  //create markdown table header
  string += '|';
  for (const header of headers) {
    string += ` ${header}`;
    string += ' '.repeat(columnLengths[headers.indexOf(header)] - header.length);
    string += ' |';
  }

  //create markdown table rows delimiter
  string += '\n|';
  for (const _ of headers) {
    string += ' ';
    string += '-'.repeat(columnLengths[headers.indexOf(_)]);
    string += ' |';
  }

  //create markdown table rows
  for (const line of lines) {
    string += '\n|';
    for (const cell of line) {
      string += ` ${cell}`;
      string += ' '.repeat(columnLengths[line.indexOf(cell)] - cell.length);
      string += ' |';
    }
  }

  return string;
}
