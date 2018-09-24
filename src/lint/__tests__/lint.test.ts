import lint = require('..');
import * as types from '../types';
// import * as fs from "fs";

describe('linter', () => {
  test('load a single rule', () => {
    const linter = new lint.Linter();
    const rule: types.LintRule = {
      type: 'truthy',
      name: 'parameter-description',
      path: 'parameter',
      enabled: true,
      description: 'parameter objects should have a description',
      truthy: 'description',
    };
    linter.registerRule(rule);

    expect(linter.rules['parameter-description'].rule).toEqual(rule);
  });

  test('load multiple rules at once', () => {
    const linter = new lint.Linter();
    const ruleA: types.LintRule = {
      type: 'truthy',
      name: 'parameter-description',
      path: '$..parameters',
      enabled: true,
      description: 'parameter objects should have a description',
      truthy: 'description',
    };
    const ruleB: types.LintRule = {
      type: 'pattern',
      name: 'parameter-name-regex',
      path: '$..parameters',
      enabled: true,
      description: 'parameter names should match RFC6570',
      pattern: { property: 'name', value: '' },
    };
    linter.registerRules([ruleA, ruleB]);

    expect(linter.rules['parameter-description'].rule).toEqual(ruleA);
    expect(linter.rules['parameter-name-regex'].rule).toEqual(ruleB);
  });

  describe('rules', () => {
    describe('truthy', () => {
      test('returns result if value is not present', () => {
        var oas = {
          info: {
            version: '5.0',
            title: 'Some API',
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'truthy',
          name: 'info-description',
          path: '$.info',
          enabled: true,
          description: 'info objects should have a description',
          truthy: 'description',
        };
        const ruleB: types.LintRule = {
          type: 'truthy',
          name: 'info-version',
          path: '$.info',
          enabled: true,
          description: 'info objects should have a version',
          truthy: 'version',
        };

        linter.registerRules([ruleA, ruleB]);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('info-description');
      });

      test('does not return result if value is present', () => {
        var oas = {
          info: {
            version: '5.0',
            title: 'Some API',
            description: 'A description',
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'truthy',
          name: 'info-description',
          path: '$.info',
          enabled: true,
          description: 'info objects should have a description',
          truthy: 'description',
        };
        const ruleB: types.LintRule = {
          type: 'truthy',
          name: 'info-version',
          path: '$.info',
          enabled: true,
          description: 'info objects should have a version',
          truthy: 'version',
        };

        linter.registerRules([ruleA, ruleB]);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('alphabetical', () => {
      test('returns result if values are not alphabetized', () => {
        var oas = {
          tags: [{ name: 'Foo', description: 'bar' }, { name: 'Bar', description: 'foo' }],
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'alphabetical',
          name: 'openapi-tags-alphabetical',
          path: '$',
          enabled: true,
          description: 'openapi object should have alphabetical tags',
          alphabetical: {
            properties: 'tags',
            keyedBy: 'name',
          },
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('openapi-tags-alphabetical');
      });

      test('does not return result if value is in alphabetical order', () => {
        var oas = {
          tags: [{ name: 'Bar', description: 'foo' }, { name: 'Foo', description: 'bar' }],
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'alphabetical',
          name: 'openapi-tags-alphabetical',
          path: '$',
          enabled: true,
          description: 'openapi object should have alphabetical tags',
          alphabetical: {
            properties: 'tags',
            keyedBy: 'name',
          },
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('or', () => {
      test('returns result if no properties are present', () => {
        var oas = {
          description1: 'A description',
          summary1: 'Yada yada yada',
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'or',
          name: 'pathItem-summary-or-description',
          path: '$',
          enabled: true,
          description: 'pathItem should have summary or description',
          or: ['summary', 'description'],
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('pathItem-summary-or-description');
      });

      test('dont returns results if any properties are present', () => {
        var oas = {
          description: 'A description',
          summary: 'Yada yada yada',
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'or',
          name: 'pathItem-summary-or-description',
          path: '$',
          enabled: true,
          description: 'pathItem should have summary or description',
          or: ['something-else', 'summary'],
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('xor', () => {
      test('returns result if no properties are present', () => {
        var oas = {
          description1: 'A description',
          summary1: 'Yada yada yada',
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'xor',
          name: 'pathItem-summary-or-description',
          path: '$',
          enabled: true,
          description: 'pathItem should have summary or description',
          xor: ['summary', 'description'],
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('pathItem-summary-or-description');
      });

      test('returns result if both properties are present', () => {
        var oas = {
          description: 'A description',
          summary: 'Yada yada yada',
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'xor',
          name: 'pathItem-summary-or-description',
          path: '$',
          enabled: true,
          description: 'pathItem should have summary or description',
          xor: ['summary', 'description'],
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('pathItem-summary-or-description');
      });

      test('dont returns results if one of the properties are present', () => {
        var oas = {
          description: 'A description',
          summary: 'Yada yada yada',
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'or',
          name: 'pathItem-summary-or-description',
          path: '$',
          enabled: true,
          description: 'pathItem should have summary or description',
          or: ['something-else', 'summary'],
        };

        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('pattern', () => {
      test('returns result if pattern is not matched (on string)', () => {
        var oas = {
          responses: {
            '401': {
              description: '',
              schema: {
                $ref: '#/definition?????s/error-response',
              },
            },
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'pattern',
          name: 'reference-components-regex',
          path: "$..['$ref']",
          enabled: true,
          description: 'reference components should all match regex ^[a-zA-Z0-9\\.\\-_]+',
          pattern: {
            property: '$ref',
            omit: '#',
            split: '/',
            value: '^[a-zA-Z0-9\\.\\-_]+$',
          },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('reference-components-regex');
      });

      test('returns result if pattern is not matched (on object)', () => {
        var oas = {
          responses: {
            '401a': {
              description: '',
              schema: {
                $ref: '#/definitions/error-response',
              },
            },
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'pattern',
          name: 'all-responses-must-be-numeric',
          path: '$..responses',
          enabled: true,
          description: 'reference components should all match regex ^[0-9]+',
          pattern: {
            property: '*',
            value: '^[0-9]+$',
          },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('all-responses-must-be-numeric');
      });

      test('dont return result if pattern is matched', () => {
        var oas = {
          responses: {
            '401': {
              description: '',
              schema: {
                $ref: '#/definitions/error-response',
              },
            },
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'pattern',
          name: 'reference-components-regex',
          path: "$..['$ref']",
          enabled: true,
          description: 'reference components should all match regex ^[a-zA-Z0-9\\.\\-_]+',
          pattern: {
            property: '$ref',
            omit: '#',
            split: '/',
            value: '^[a-zA-Z0-9\\.\\-_]+$',
          },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('notContain', () => {
      test('returns result if property contains value', () => {
        var oas = {
          swagger: '2.0',
          info: {
            version: '1.0',
            title: 'To-do Demo',
            description:
              "### Notes:\n\nThis OAS2 (Swagger 2) specification defines common models and responses, that other specifications may reference.\n\nFor example, check out the user poperty in the main.oas2 todo-partial model - it references the user model in this specification!\n\nLikewise, the main.oas2 operations reference the shared error responses in this common specification.\n\n<script>console.log('sup homie');</script>",
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'notContain',
          name: 'no-script-tags-in-markdown',
          path: '$..*',
          enabled: true,
          description: 'markdown descriptions should not contain <script> tags',
          notContain: { properties: ['description'], value: '<script' },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('no-script-tags-in-markdown');
      });

      test('dont return results if property doesnt contain value', () => {
        var oas = {
          swagger: '2.0',
          info: {
            version: '1.0',
            title: 'To-do Demo',
            description:
              '### Notes:\n\nThis OAS2 (Swagger 2) specification defines common models and responses, that other specifications may reference.\n\nFor example, check out the user poperty in the main.oas2 todo-partial model - it references the user model in this specification!\n\nLikewise, the main.oas2 operations reference the shared error responses in this common specification.',
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'notContain',
          name: 'no-script-tags-in-markdown',
          path: '$..*',
          enabled: true,
          description: 'markdown descriptions should not contain <script> tags',
          notContain: { properties: ['description'], value: '<script' },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('notEndWith', () => {
      test('return result if property ends with value', () => {
        var oas = {
          openapi: '3.0.0',
          info: {
            version: '5.0',
            title: 'Rooms API',
          },
          servers: [
            {
              url: 'http://localhost:5000/',
              description: 'Development server',
            },
            {
              url: 'https://rooms-staging.wework.com',
              description: 'Staging server',
            },
          ],
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'notEndWith',
          name: 'server-trailing-slash',
          path: '$.servers',
          enabled: true,
          description: 'server url should not have a trailing slash',
          notEndWith: { property: 'url', value: '/' },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('server-trailing-slash');
      });

      test('dont return result if property doesnt end with value', () => {
        var oas = {
          openapi: '3.0.0',
          info: {
            version: '5.0',
            title: 'Rooms API',
          },
          servers: [
            {
              url: 'http://localhost:5000',
              description: 'Development server',
            },
            {
              url: 'https://rooms-staging.wework.com',
              description: 'Staging server',
            },
          ],
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'notEndWith',
          name: 'server-trailing-slash',
          path: '$.servers',
          enabled: true,
          description: 'server url should not have a trailing slash',
          notEndWith: { property: 'url', value: '/' },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
    describe('maxLength', () => {
      test('return result if property is longer than value', () => {
        var oas = {
          paths: {
            '/rooms/{room_id}/reserve/': {
              post: {
                description: '',
                summary: 'Book Room Really fsdasddssdfgfdhdsafhsad fsad flong fjkdhfsds',
              },
            },
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'maxLength',
          name: 'short-summary',
          path: '$..summary',
          enabled: true,
          description: 'summary should be short (description can be long)',
          maxLength: {
            value: 20,
          },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(1);
        expect(results[0].ruleName).toEqual('short-summary');
      });

      test('dont return result if property is shorter than value', () => {
        var oas = {
          paths: {
            '/rooms/{room_id}/reserve/': {
              post: {
                description: '',
                summary: 'Book Room Really',
              },
            },
          },
        };

        const linter = new lint.Linter();
        const ruleA: types.LintRule = {
          type: 'maxLength',
          name: 'short-summary',
          path: '$..summary',
          enabled: true,
          description: 'summary should be short (description can be long)',
          maxLength: {
            value: 20,
          },
        };
        linter.registerRule(ruleA);

        const results = linter.lint(oas);
        expect(results.length).toEqual(0);
      });
    });
  });
});
