import { promisify } from 'util';
import { Parser } from 'xml2js';
import { sortResults } from '../../utils';
import { junit } from '../junit';

const oas3SchemaErrors = sortResults(require('./__fixtures__/oas3-schema-errors.json'));
const mixedErrors = sortResults(require('./__fixtures__/mixed-errors.json'));

describe('JUnit formatter', () => {
  let parse: Parser['parseString'];

  beforeEach(() => {
    const parser = new Parser();
    parse = promisify(parser.parseString.bind(parser));
  });

  test('should produce valid report', async () => {
    const result = await parse(junit(oas3SchemaErrors));
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
                  name: 'org.spectral.oas3-schema',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'should NOT have additional properties: type',
                    },
                    _:
                      'line 36, col 22, should NOT have additional properties: type (oas3-schema) at path #/paths/~1pets/get/responses/200/headers/header-1',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: 'should match exactly one schema in oneOf',
                    },
                    _:
                      'line 36, col 22, should match exactly one schema in oneOf (oas3-schema) at path #/paths/~1pets/get/responses/200/headers/header-1',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema',
                  time: '0',
                },
                failure: [
                  {
                    $: {
                      message: "should have required property '$ref'",
                    },
                    _:
                      'line 36, col 22, should have required property &apos;$ref&apos; (oas3-schema) at path #/paths/~1pets/get/responses/200/headers/header-1',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  test('should filter out non-error validation results', async () => {
    const result = await parse(junit(mixedErrors));
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
                  name: 'org.spectral.info-matches-stoplight',
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
});
