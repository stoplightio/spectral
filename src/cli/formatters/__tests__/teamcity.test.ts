import { DiagnosticSeverity } from '@stoplight/types';
import { sortResults } from '../../../utils';
import { teamcity } from '../teamcity';

const mixedErrors = sortResults(require('./__fixtures__/mixed-errors.json'));

describe('Teamcity formatter', () => {
  it('should format messages', () => {
    const result = teamcity(mixedErrors, { failSeverity: DiagnosticSeverity.Error });
    expect(result)
      .toContain(`##teamcity[inspectionType category='openapi' id='info-contact' name='info-contact' description='hint -- Info object should contain \`contact\` object.']
##teamcity[inspection typeId='info-contact' file='/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json' line='3' message='hint -- Info object should contain \`contact\` object.']
##teamcity[inspectionType category='openapi' id='info-description' name='info-description' description='warning -- OpenAPI object info \`description\` must be present and non-empty string.']
##teamcity[inspection typeId='info-description' file='/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json' line='3' message='warning -- OpenAPI object info \`description\` must be present and non-empty string.']
##teamcity[inspectionType category='openapi' id='info-matches-stoplight' name='info-matches-stoplight' description='error -- Info must contain Stoplight']
##teamcity[inspection typeId='info-matches-stoplight' file='/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json' line='5' message='error -- Info must contain Stoplight']
##teamcity[inspectionType category='openapi' id='operation-description' name='operation-description' description='information -- Operation \`description\` must be present and non-empty string.']
##teamcity[inspection typeId='operation-description' file='/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json' line='17' message='information -- Operation \`description\` must be present and non-empty string.']
##teamcity[inspectionType category='openapi' id='operation-description' name='operation-description' description='information -- Operation \`description\` must be present and non-empty string.']
##teamcity[inspection typeId='operation-description' file='/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json' line='64' message='information -- Operation \`description\` must be present and non-empty string.']
##teamcity[inspectionType category='openapi' id='operation-description' name='operation-description' description='information -- Operation \`description\` must be present and non-empty string.']
##teamcity[inspection typeId='operation-description' file='/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json' line='86' message='information -- Operation \`description\` must be present and non-empty string.']`);
  });
});
