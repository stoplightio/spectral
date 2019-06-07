import { stylish } from '../stylish';

const results = [
  {
    code: 'oas3-schema',
    summary: 'Validate structure of OpenAPIv3 specification.',
    message: 'should NOT have additional properties: type',
    path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
    severity: 0,
    source: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3.yaml',
    range: {
      start: {
        line: 35,
        character: 21,
      },
      end: {
        line: 37,
        character: 21,
      },
    },
  },
  {
    code: 'oas3-schema',
    summary: 'Validate structure of OpenAPIv3 specification.',
    message: 'should match exactly one schema in oneOf',
    path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
    severity: 0,
    source: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3.yaml',
    range: {
      start: {
        line: 35,
        character: 21,
      },
      end: {
        line: 37,
        character: 21,
      },
    },
  },
  {
    code: 'oas3-schema',
    summary: 'Validate structure of OpenAPIv3 specification.',
    message: "should have required property '$ref'",
    path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
    severity: 0,
    source: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3.yaml',
    range: {
      start: {
        line: 35,
        character: 21,
      },
      end: {
        line: 37,
        character: 21,
      },
    },
  },
];

describe('Stylish formatter', () => {
  test('should prefer message for oas-schema errors', () => {
    const result = stylish(results);
    expect(result).toContain('oas3-schema  should NOT have additional properties: type\n');
    expect(result).toContain('oas3-schema  should match exactly one schema in oneOf');
    expect(result).toContain("oas3-schema  should have required property '$ref'\n");
  });
});
