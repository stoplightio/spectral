import { DiagnosticSeverity } from '@stoplight/types';
import * as chalk from 'chalk';
import { sortResults } from '../../../utils';
import { pretty } from '../pretty';

const oas3SchemaErrors = sortResults(require('./__fixtures__/oas3-schema-errors.json'));
const mixedErrors = sortResults(require('./__fixtures__/mixed-errors.json'));

function setColumnWidth(width: number, func: CallableFunction): void {
  const og = process.stdout.columns;
  process.stdout.columns = width;
  try {
    func(width);
  } finally {
    process.stdout.columns = og;
  }
}
function forceWrapped(s: string, wrapType: number): string {
  // Occurs when line is wrapped at non-whitespace character
  if (wrapType === 0) {
    // first line
    return s.slice(0, s.length - 5);
  } else if (wrapType === 1) {
    // middle line
    return s.slice(5, s.length - 5);
  } else {
    // end line
    return s.slice(5, s.length);
  }
}

describe('Pretty formatter', () => {
  test('should not wrap when terminal width is wide enough', () => {
    setColumnWidth(185, function (): void {
      const result = pretty(oas3SchemaErrors, { failSeverity: DiagnosticSeverity.Error });
      expect(result).toContain(
        `${chalk.red('36:22')}       ${chalk.red.inverse('ERROR')}        ${chalk.red.bold(
          'oas3-schema',
        )}                     ${chalk.gray(
          'should NOT have additional properties: type',
        )}                      ${chalk.cyan('paths./pets.get.responses[200].headers.header-1')}`,
      );
      expect(result).toContain(
        `${chalk.red('36:22')}       ${chalk.red.inverse('ERROR')}        ${chalk.red.bold(
          'oas3-schema',
        )}                     ${chalk.gray(
          'should match exactly one schema in oneOf',
        )}                         ${chalk.cyan('paths./pets.get.responses[200].headers.header-1')}`,
      );
      expect(result).toContain(
        `${chalk.red('36:22')}       ${chalk.red.inverse('ERROR')}        ${chalk.red.bold(
          'oas3-schema',
        )}                     ${chalk.gray(
          "should have required property '$ref'",
        )}                             ${chalk.cyan('paths./pets.get.responses[200].headers.header-1')}`,
      );
      expect(result).toContain(chalk.red.bold('1 Unique Issue(s)'));
    });
  });
  test('should wrap when terminal width is very small', () => {
    setColumnWidth(120, function (): void {
      const result = pretty(oas3SchemaErrors, { failSeverity: DiagnosticSeverity.Error });
      expect(result).toContain(`
File:   /home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3.yaml
${chalk.red(
  '36:22',
)}       ${chalk.red.inverse('ERROR')}        ${forceWrapped(chalk.red.bold('oas3-sch'), 0)}  ${chalk.gray('should NOT have')}       ${chalk.cyan('paths./pets.get.responses[200].headers.header-1')}
                         ${forceWrapped(chalk.red.bold('ema'), 2)}       ${chalk.gray('additional')}
                                   ${chalk.gray('properties: type')}

${chalk.red(
  '36:22',
)}       ${chalk.red.inverse('ERROR')}        ${forceWrapped(chalk.red.bold('oas3-sch'), 0)}  ${chalk.gray('should match exactly')}  ${chalk.cyan('paths./pets.get.responses[200].headers.header-1')}
                         ${forceWrapped(chalk.red.bold('ema'), 2)}       ${chalk.gray('one schema in oneOf')}

${chalk.red(
  '36:22',
)}       ${chalk.red.inverse('ERROR')}        ${forceWrapped(chalk.red.bold('oas3-sch'), 0)}  ${chalk.gray('should have required')}  ${chalk.cyan('paths./pets.get.responses[200].headers.header-1')}
                         ${forceWrapped(chalk.red.bold('ema'), 2)}       ${chalk.gray("property '$ref'")}

${chalk.red.bold('1 Unique Issue(s)')}\n`);
    });
  });
  test('should display proper severity level', () => {
    setColumnWidth(185, function (): void {
      const result = pretty(mixedErrors, { failSeverity: DiagnosticSeverity.Error });
      expect(
        result,
      ).toContain(`${chalk.white('3:10')}        ${chalk.white.inverse('HINT')}         ${chalk.white.bold('info-contact')}                    ${chalk.gray('Info object should contain `contact` object.')}                     ${chalk.cyan('info')}

${chalk.yellow(
  '3:10',
)}        ${chalk.yellow.inverse('WARNING')}      ${chalk.yellow.bold('info-description')}                ${chalk.gray('OpenAPI object info `description` must be present and non-empty')}  ${chalk.cyan('info')}
                                                         ${chalk.gray('string.')}

${chalk.red(
  '5:14',
)}        ${chalk.red.inverse('ERROR')}        ${chalk.red.bold('info-matches-stoplight')}          ${chalk.gray('Info must contain Stoplight')}                                      ${chalk.cyan('info.title')}

${chalk.blue(
  '17:13',
)}       ${chalk.blue.inverse('INFORMATION')}  ${chalk.blue.bold('operation-description')}           ${chalk.gray('Operation `description` must be present and non-empty string.')}    ${chalk.cyan('paths./pets.get')}

${chalk.blue(
  '64:14',
)}       ${chalk.blue.inverse('INFORMATION')}  ${chalk.blue.bold('operation-description')}           ${chalk.gray('Operation `description` must be present and non-empty string.')}    ${chalk.cyan('paths./pets.post')}

${chalk.blue(
  '86:13',
)}       ${chalk.blue.inverse('INFORMATION')}  ${chalk.blue.bold('operation-description')}           ${chalk.gray('Operation `description` must be present and non-empty string.')}    ${chalk.cyan('paths./pets/{petId}.get')}

${chalk.red.bold('4 Unique Issue(s)')}\n`);
    });
  });
});
