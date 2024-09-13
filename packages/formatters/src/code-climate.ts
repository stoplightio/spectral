import { DiagnosticSeverity } from '@stoplight/types';
import { Formatter } from './types';
import { relative } from '@stoplight/path';

/**
 * @see https://github.com/codeclimate/platform/blob/690633cb2a08839a5bfa350ed925ddb6de55bbdc/spec/analyzers/SPEC.md#data-types
 */
interface CodeClimateIssue {
  type: 'issue';
  check_name: string;
  description: string;
  categories: CodeClimateIssueCategory[];
  location: CodeClimateIssueLocation;
  content?: { body: string };
  trace?: CodeClimateIssueTrace;
  remediation_points?: number;
  severity?: CodeClimateIssueSeverity;
  fingerprint?: string;
}
type CodeClimateIssueCategory =
  | 'Bug Risk'
  | 'Clarity'
  | 'Compatibility'
  | 'Complexity'
  | 'Duplication'
  | 'Performance'
  | 'Security'
  | 'Style';
interface CodeClimateIssueLocation {
  path: string;
  positions: {
    begin: { line: number; column: number };
    end: { line: number; column: number };
  };
}
interface CodeClimateIssueTrace {
  locations: CodeClimateIssueLocation[];
  stackTrace: boolean;
}
type CodeClimateIssueSeverity = 'info' | 'minor' | 'major' | 'critical' | 'blocker';
const severityMap: Record<DiagnosticSeverity, CodeClimateIssueSeverity> = {
  [DiagnosticSeverity.Error]: 'critical',
  [DiagnosticSeverity.Warning]: 'major',
  [DiagnosticSeverity.Information]: 'minor',
  [DiagnosticSeverity.Hint]: 'info',
};

export const codeClimate: Formatter = results => {
  const outputJson: CodeClimateIssue[] = results.map(result => {
    const relPath = relative(process.cwd(), result.source ?? '').replace(/\\/g, '/');
    const fingerprint = `${relPath}:${result.path.join('.')}:${result.code}`;
    return {
      type: 'issue' as const,
      check_name: result.code.toString(),
      description: result.message,
      categories: ['Style'],
      location: {
        path: relPath,
        positions: {
          begin: { line: result.range.start.line, column: result.range.start.character },
          end: { line: result.range.end.line, column: result.range.end.character },
        },
      },
      severity: severityMap[result.severity],
      fingerprint,
    };
  });
  return JSON.stringify(outputJson, null, '\t');
};
