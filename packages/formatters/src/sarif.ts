import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { relative } from '@stoplight/path';
import { SarifBuilder, SarifRunBuilder, SarifResultBuilder, SarifRuleBuilder } from 'node-sarif-builder';
import type { Result } from 'sarif';
import type { Formatter } from './types';

const OUTPUT_TYPES: Dictionary<Result.level, DiagnosticSeverity> = {
  [DiagnosticSeverity.Error]: 'error',
  [DiagnosticSeverity.Warning]: 'warning',
  [DiagnosticSeverity.Information]: 'note',
  [DiagnosticSeverity.Hint]: 'note',
};

export const sarif: Formatter = (results, _, ctx) => {
  if (ctx === void 0) {
    throw Error('sarif formatter requires ctx');
  }

  const sarifBuilder = new SarifBuilder({
    $schema: 'http://json.schemastore.org/sarif-2.1.0-rtm.6.json',
    version: '2.1.0',
    runs: [],
  });

  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'spectral',
    toolDriverVersion: ctx.spectralVersion,
    url: 'https://github.com/stoplightio/spectral',
  });

  // add rules
  for (const rule of Object.values(ctx.ruleset.rules)) {
    const sarifRuleBuilder = new SarifRuleBuilder().initSimple({
      ruleId: rule.name,
      shortDescriptionText: rule.description ?? 'No description.',
      helpUri: rule.documentationUrl !== null ? rule.documentationUrl : undefined,
    });
    sarifRunBuilder.addRule(sarifRuleBuilder);
  }

  // add results
  for (const result of results) {
    const sarifResultBuilder = new SarifResultBuilder();
    const severity: DiagnosticSeverity = result.severity || DiagnosticSeverity.Error;
    sarifResultBuilder.initSimple({
      level: OUTPUT_TYPES[severity] || 'error',
      messageText: result.message,
      ruleId: result.code.toString(),
      fileUri: relative(process.cwd(), result.source ?? '').replace(/\\/g, '/'),
      startLine: result.range.start.line + 1,
      startColumn: result.range.start.character + 1,
      endLine: result.range.end.line + 1,
      endColumn: result.range.end.character + 1,
    });
    sarifRunBuilder.addResult(sarifResultBuilder);
  }

  sarifBuilder.addRun(sarifRunBuilder);
  return sarifBuilder.buildSarifJsonString({ indent: true });
};
