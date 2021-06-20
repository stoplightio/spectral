import { Dictionary, Optional } from '@stoplight/types';
import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import { Formatter } from './types';
import { getSeverityName, groupBySource } from './utils';

function escapeString(str: Optional<string | number>): string {
  if (str === void 0) {
    return '';
  }
  return String(str)
    .replace(/\|/g, '||')
    .replace(/'/g, "|'")
    .replace(/\n/g, '|n')
    .replace(/\r/g, '|r')
    .replace(/\u0085/g, '|x') // TeamCity 6
    .replace(/\u2028/g, '|l') // TeamCity 6
    .replace(/\u2029/g, '|p') // TeamCity 6
    .replace(/\[/g, '|[')
    .replace(/\]/g, '|]');
}

function inspectionType(result: ISpectralDiagnostic & { source: string }): string {
  const code = escapeString(result.code);
  const severity = getSeverityName(result.severity);
  const message = escapeString(result.message);
  return `##teamcity[inspectionType category='openapi' id='${code}' name='${code}' description='${severity} -- ${message}']`;
}

function inspection(result: ISpectralDiagnostic & { source: string }): string {
  const code = escapeString(result.code);
  const severity = getSeverityName(result.severity);
  const message = escapeString(result.message);
  const line = result.range.start.line + 1;
  return `##teamcity[inspection typeId='${code}' file='${result.source}' line='${line}' message='${severity} -- ${message}']`;
}

function renderResults(results: ISpectralDiagnostic[]): string {
  return results
    .filter<ISpectralDiagnostic & { source: string }>(
      (result): result is ISpectralDiagnostic & { source: string } => typeof result.source === 'string',
    )
    .map(result => `${inspectionType(result)}\n${inspection(result)}`)
    .join('\n');
}

function renderGroupedResults(groupedResults: Dictionary<ISpectralDiagnostic[]>): string {
  return Object.keys(groupedResults)
    .map(source => renderResults(groupedResults[source]))
    .join('\n');
}

export const teamcity: Formatter = results => {
  const groupedResults = groupBySource(results);
  return renderGroupedResults(groupedResults);
};
