import { promisify } from 'util';
import { Parser } from 'xml2js';
import { junit } from '../junit';

const results = require('./__fixtures__/oas3-schema-errors.json');

describe('JUnit formatter', () => {
  let parse: Parser['parseString'];

  beforeEach(() => {
    const parser = new Parser();
    parse = promisify(parser.parseString.bind(parser));
  });

  test('should produce valid report', async () => {
    const result = await parse(junit(results));
    expect(result).toEqual({
      testsuites: {
        testsuite: [
          {
            $: {
              errors: '3',
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
                error: [
                  {
                    $: {
                      message: 'should NOT have additional properties: type',
                    },
                    _: 'line 36, col 22, Error - should NOT have additional properties: type (oas3-schema)',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema',
                  time: '0',
                },
                error: [
                  {
                    $: {
                      message: 'should match exactly one schema in oneOf',
                    },
                    _: 'line 36, col 22, Error - should match exactly one schema in oneOf (oas3-schema)',
                  },
                ],
              },
              {
                $: {
                  classname: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.invalid-schema.oas3',
                  name: 'org.spectral.oas3-schema',
                  time: '0',
                },
                error: [
                  {
                    $: {
                      message: "should have required property '$ref'",
                    },
                    _: 'line 36, col 22, Error - should have required property &apos;$ref&apos; (oas3-schema)',
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
