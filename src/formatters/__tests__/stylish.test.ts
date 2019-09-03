import { stylish } from '../stylish';

const results = require('./__fixtures__/oas3-schema-errors.json');

describe('Stylish formatter', () => {
  test('should prefer message for oas-schema errors', () => {
    const result = stylish(results);
    expect(result).toContain('oas3-schema  should NOT have additional properties: type\n');
    expect(result).toContain('oas3-schema  should match exactly one schema in oneOf');
    expect(result).toContain("oas3-schema  should have required property '$ref'\n");
  });
});
