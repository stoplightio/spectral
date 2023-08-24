import { Parser } from 'xml2js';
import { junit } from '../junit';
import { DiagnosticSeverity } from '@stoplight/types';

import oas3SchemaErrors from './__fixtures__/oas3-schema-errors.json';
import mixedErrors from './__fixtures__/mixed-errors.json';
import specialXmlStrings from './__fixtures__/errors-with-special-xml-strings.json';

describe('JUnit formatter', () => {
  let parse: Parser['parseStringPromise'];

  beforeEach(() => {
    const parser = new Parser();
    parse = parser.parseStringPromise.bind(parser);
  });

  test('should produce valid report', async () => {
    const result = await parse(junit(oas3SchemaErrors, { failSeverity: DiagnosticSeverity.Error }));
    expect(result).toEqual({
      testsuites: {
        testsuite: [
          {
            $: {
              errors: '0',
              failures: '3',
              name: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3.yaml',
              package: 'org.spectral',
              tests: '3',
              time: '0',
            },
            testcase: [
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema(#/paths/~1pets/get/responses/200/headers/header-1)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'should NOT have additional properties: type',
                    },
                    _: 'line 36, col 22, should NOT have additional properties: type (oas3-schema) at path #/paths/~1pets/get/responses/200/headers/header-1',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema(#/paths/~1pets/get/responses/200/headers/header-1)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'should match exactly one schema in oneOf',
                    },
                    _: 'line 36, col 22, should match exactly one schema in oneOf (oas3-schema) at path #/paths/~1pets/get/responses/200/headers/header-1',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema(#/paths/~1pets/get/responses/200/headers/header-1)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: "should have required property '$ref'",
                    },
                    _: "line 36, col 22, should have required property '$ref' (oas3-schema) at path #/paths/~1pets/get/responses/200/headers/header-1",
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  test('given failSeverity set to error, should filter out non-error validation results', async () => {
    const result = await parse(junit(mixedErrors, { failSeverity: DiagnosticSeverity.Error }));
    expect(result).toEqual({
      testsuites: {
        testsuite: [
          {
            $: {
              errors: '0',
              failures: '1',
              name: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json',
              package: 'org.spectral',
              tests: '1',
              time: '0',
            },
            testcase: [
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3',
                  name: 'org.spectral.info-matches-stoplight(#/info/title)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'Info must contain Stoplight',
                    },
                    _: 'line 5, col 14, Info must contain Stoplight (info-matches-stoplight) at path #/info/title',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  test('given failSeverity set to other value than error, should filter treat all validation results matching the severity as errors', async () => {
    const result = await parse(junit(mixedErrors, { failSeverity: DiagnosticSeverity.Warning }));
    expect(result).toEqual({
      testsuites: {
        testsuite: [
          {
            $: {
              errors: '0',
              failures: '2',
              name: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json',
              package: 'org.spectral',
              tests: '2',
              time: '0',
            },
            testcase: [
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3',
                  name: 'org.spectral.info-description(#/info)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'OpenAPI object info `description` must be present and non-empty string.',
                    },
                    _: 'line 3, col 10, OpenAPI object info `description` must be present and non-empty string. (info-description) at path #/info',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3',
                  name: 'org.spectral.info-matches-stoplight(#/info/title)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'Info must contain Stoplight',
                    },
                    _: 'line 5, col 14, Info must contain Stoplight (info-matches-stoplight) at path #/info/title',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  test('handles special XML strings properly', async () => {
    const result = await parse(junit(specialXmlStrings, { failSeverity: DiagnosticSeverity.Error }));
    expect(result).toEqual({
      testsuites: {
        testsuite: [
          {
            $: {
              errors: '0',
              failures: '2',
              name: '',
              package: 'org.spectral',
              tests: '2',
              time: '0',
            },
            testcase: [
              {
                $: {
                  classname: '',
                  name: "org.spectral.special-xml-strings(#/root/'/%22/leaf)",
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'start \' " < > end',
                    },
                    _: "line 1, col 1, start ' \" < > end (special-xml-strings) at path #/root/'/%22/leaf",
                  },
                ],
              },
              {
                $: {
                  classname: '',
                  name: 'org.spectral.special-cdata-strings(#/root/%5D%5D%3E/%3C!%5BCDATA%5B/leaf)',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'start <![CDATA[ ]]> <![CDATA[ end',
                    },
                    _: 'line 1, col 1, start <![CDATA[ ]]> <![CDATA[ end (special-cdata-strings) at path #/root/%5D%5D%3E/%3C!%5BCDATA%5B/leaf',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });
});
