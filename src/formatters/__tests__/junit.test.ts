import { promisify } from 'util';
import { Parser } from 'xml2js';
import { junit } from '../junit';

const oas3SchemaErrors = require('./__fixtures__/oas3-schema-errors.json');
const mixedErrors = require('./__fixtures__/mixed-errors-with-different-paths.json');

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
                      path: '#/paths/~1pets/get/responses/200/headers/header-1',
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
                      path: '#/paths/~1pets/get/responses/200/headers/header-1',
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
                      path: '#/paths/~1pets/get/responses/200/headers/header-1',
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

  test('should produce valid paths', async () => {
    const result = await parse(junit(mixedErrors));
    expect(result).toEqual({
      testsuites: {
        testsuite: [
          {
            $: {
              errors: '4',
              name: '/home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json',
              package: 'org.spectral',
              tests: '4',
              time: '0',
            },
            testcase: [
              {
                $: expect.objectContaining({
                  name: 'org.spectral.info-contact',
                }),
                hint: [
                  expect.objectContaining({
                    $: {
                      message: 'Info object should contain `contact` object.',
                      path: '#',
                    },
                  }),
                ],
              },
              {
                $: expect.objectContaining({
                  name: 'org.spectral.info-description',
                }),
                warning: [
                  expect.objectContaining({
                    $: {
                      message: 'OpenAPI object info `description` must be present and non-empty string.',
                      path: '#/',
                    },
                  }),
                ],
              },
              {
                $: expect.objectContaining({
                  name: 'org.spectral.operation-description',
                }),
                information: [
                  expect.objectContaining({
                    $: {
                      message: 'Operation `description` must be present and non-empty string.',
                      path: '#/paths/~1pets/post',
                    },
                  }),
                ],
              },
              {
                $: expect.objectContaining({
                  name: 'org.spectral.info-matches-stoplight',
                }),
                error: [
                  expect.objectContaining({
                    $: {
                      message: 'Info must contain Stoplight',
                      path: '#/info/title',
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
    });
  });
});
