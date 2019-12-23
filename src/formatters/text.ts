import { Dictionary } from '@stoplight/types';
import { IRuleResult } from '../types';
import { Formatter } from './types';
import { getSeverityName, groupBySource } from './utils';

function renderResults(results: IRuleResult[], parentIndex: number) {
  return results
    .map(result => {
      const line = result.range.start.line + 1;
      const character = result.range.start.character + 1;
      const severity = getSeverityName(result.severity);
      return `${result.source}:${line}:${character} ${severity} ${result.code} "${result.message}"`;
    })
    .join('\n');
}

function renderGroupedResults(groupedResults: Dictionary<IRuleResult[]>) {
  return Object.keys(groupedResults)
    .map((source, index) => renderResults(groupedResults[source], index))
    .join('\n');
}

export const text: Formatter = results => {
  const groupedResults = groupBySource(results);
  return renderGroupedResults(groupedResults);
};
