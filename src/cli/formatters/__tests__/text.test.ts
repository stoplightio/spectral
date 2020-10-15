import { DiagnosticSeverity } from '@stoplight/types';
import { sortResults } from '../../../utils';
import { text } from '../text';

const mixedErrors = sortResults(require('./__fixtures__/mixed-errors.json'));

describe('Text formatter', () => {
  test('should format messages', () => {
    const result = text(mixedErrors, { failSeverity: DiagnosticSeverity.Error });
    expect(result)
      .toContain(`/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json:3:10 hint info-contact "Info object should contain \`contact\` object."
/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json:3:10 warning info-description "OpenAPI object info \`description\` must be present and non-empty string."
/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json:5:14 error info-matches-stoplight "Info must contain Stoplight"
/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json:17:13 information operation-description "Operation \`description\` must be present and non-empty string."
/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json:64:14 information operation-description "Operation \`description\` must be present and non-empty string."
/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json:86:13 information operation-description "Operation \`description\` must be present and non-empty string."`);
  });
});
