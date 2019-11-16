import chalk = require('chalk');

import { stylish } from '../stylish';

const oas3SchemaErrors = require('./__fixtures__/oas3-schema-errors.json');
const mixedErrors = require('./__fixtures__/mixed-errors.json');

describe('Stylish formatter', () => {
  test('should prefer message for oas-schema errors', () => {
    const result = stylish(oas3SchemaErrors);
    expect(result).toContain('oas3-schema  should NOT have additional properties: type\n');
    expect(result).toContain('oas3-schema  should match exactly one schema in oneOf');
    expect(result).toContain("oas3-schema  should have required property '$ref'\n");
  });

  test('should display proper severity level', () => {
    const result = stylish(mixedErrors);
    expect(result).toContain(`
  3:10         ${chalk.white('hint')}  info-contact            Info object should contain \`contact\` object.
  3:10      ${chalk.yellow(
    'warning',
  )}  info-description        OpenAPI object info \`description\` must be present and non-empty string.
  5:14        ${chalk.red('error')}  info-matches-stoplight  Info must contain Stoplight
 17:13  ${chalk.blue(
   'information',
 )}  operation-description   Operation \`description\` must be present and non-empty string.
 64:14  ${chalk.blue(
   'information',
 )}  operation-description   Operation \`description\` must be present and non-empty string.
 86:13  ${chalk.blue(
   'information',
 )}  operation-description   Operation \`description\` must be present and non-empty string.`);
  });
});
