import { DiagnosticSeverity } from '@stoplight/types';
import * as chalk from 'chalk';
import { sortResults } from '../../../utils';
import { stylish } from '../stylish';

const oas3SchemaErrors = sortResults(require('./__fixtures__/oas3-schema-errors.json'));
const mixedErrors = sortResults(require('./__fixtures__/mixed-errors.json'));

describe('Stylish formatter', () => {
  it('should prefer message for oas-schema errors', () => {
    const result = stylish(oas3SchemaErrors, { failSeverity: DiagnosticSeverity.Error });
    expect(result).toContain('oas3-schema  should NOT have additional properties: type');
    expect(result).toContain('oas3-schema  should match exactly one schema in oneOf');
    expect(result).toContain("oas3-schema  should have required property '$ref'");
  });

  it('should display proper severity level', () => {
    const result = stylish(mixedErrors, { failSeverity: DiagnosticSeverity.Error });
    expect(result).toContain(`
  3:10         ${chalk.white(
    'hint',
  )}  info-contact            Info object should contain \`contact\` object.                             info
  3:10      ${chalk.yellow(
    'warning',
  )}  info-description        OpenAPI object info \`description\` must be present and non-empty string.  info
  5:14        ${chalk.red(
    'error',
  )}  info-matches-stoplight  Info must contain Stoplight                                              info.title
 17:13  ${chalk.blue(
   'information',
 )}  operation-description   Operation \`description\` must be present and non-empty string.            paths./pets.get
 64:14  ${chalk.blue(
   'information',
 )}  operation-description   Operation \`description\` must be present and non-empty string.            paths./pets.post
 86:13  ${chalk.blue(
   'information',
 )}  operation-description   Operation \`description\` must be present and non-empty string.            paths./pets/{petId}.get`);
  });
});
