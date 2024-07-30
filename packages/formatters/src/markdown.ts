import { printPath, PrintStyle } from '@stoplight/spectral-runtime';
import { Formatter, FormatterContext } from './types';
import { groupBySource } from './utils';
import { DiagnosticSeverity } from '@stoplight/types';
import { getMarkdownTable } from 'markdown-table-ts';
import markdownEscape from 'markdown-escape';
import { getRuleDocumentationUrl } from './utils/getDocumentationUrl';

export const markdown: Formatter = (results, { failSeverity }, ctx?: FormatterContext) => {
  const groupedResults = groupBySource(results);

  const body: string[][] = [];
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
        body.push([codeWithOptionalLink, escapedPath, escapedMessage, severityString, start, end, escapedSource]);
      }
    }
  }

  const table = getMarkdownTable({
    table: {
      head: ['Code', 'Path', 'Message', 'Severity', 'Start', 'End', 'Source'],
      body: body,
    },
  });

  return table;
};
