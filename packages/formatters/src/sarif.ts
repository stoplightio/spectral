import { Formatter } from './types';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { relative } from '@stoplight/path';
import { SarifBuilder, SarifRunBuilder, SarifResultBuilder, SarifRuleBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';

const pkg = require('../../cli/package.json') as PackageJson;

interface PackageJson {
  version: string;
}

const OUTPUT_TYPES: Dictionary<Result.level, DiagnosticSeverity> = {
  [DiagnosticSeverity.Error]: 'error',
  [DiagnosticSeverity.Warning]: 'warning',
  [DiagnosticSeverity.Information]: 'note',
  [DiagnosticSeverity.Hint]: 'note',
};

export const sarif: Formatter = results => {
  const sarifBuilder = new SarifBuilder({
    $schema: 'http://json.schemastore.org/sarif-2.1.0-rtm.6.json',
    version: '2.1.0',
    runs: [],
  });

  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'spectral',
    toolDriverVersion: pkg.version,
    url: 'https://github.com/stoplightio/spectral',
  });

  const uniqueRuleIds = new Set<string>();
  results.forEach(result => {
    const ruleId = result.code.toString();

    // add to rules
    if (!uniqueRuleIds.has(ruleId)) {
      uniqueRuleIds.add(ruleId);
      const sarifRuleBuilder = new SarifRuleBuilder().initSimple({
        ruleId,
        shortDescriptionText: result.message,
      });
      sarifRunBuilder.addRule(sarifRuleBuilder);
    }

    // add to results
    const sarifResultBuilder = new SarifResultBuilder();
    const severity: DiagnosticSeverity = result.severity || DiagnosticSeverity.Error;
    sarifResultBuilder.initSimple({
      level: OUTPUT_TYPES[severity] || 'error',
      messageText: result.message,
      ruleId: ruleId,
      fileUri: relative(process.cwd(), result.source ?? '').replace(/\\/g, '/'),
      startLine: (result.range.start.line || 1) + 1,
      startColumn: result.range.start.character || 1,
      endLine: (result.range.end.line || 1) + 1,
      endColumn: result.range.end.character || 1,
    });
    sarifRunBuilder.addResult(sarifResultBuilder);
  });

  sarifBuilder.addRun(sarifRunBuilder);
  return sarifBuilder.buildSarifJsonString({ indent: true });
};

export const sarifToolVersion: string = pkg.version;
