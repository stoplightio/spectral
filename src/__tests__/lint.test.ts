import { Spectral } from 'spectral';
import * as types from 'spectral/types';

// const defaults = require('../../rules/default.json');

const oasSample: any = {
  swagger: '2.0',
  info: {
    version: '1.0.0',
    title: 'Swagger Petstore',
    termsOfService: 'http://swagger.io/terms/',
    contact: {
      email: 'apiteam@swagger.io',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
};

describe('lint', () => {
  describe('rules', () => {
    describe('truthy', () => {
      const truthyRuleConfig: types.IRuleConfig = {
        rules: {
          oas2: {
            'lint:parameter-description': {
              category: 'lint',
              type: 'truthy',
              path: '$..paths.*.*.parameters',
              enabled: true,
              description: 'parameter objects should have a description',
              truthy: 'description',
            },
          },
        },
      };

      test.only('returns result if value is not present', () => {
        const s = new Spectral(truthyRuleConfig);
        const results = s.apply(oasSample, 'oas2');
        expect(results.length).toEqual(1);
        // expect(results[0].ruleName).toEqual('info-description');
      });
    });
  });
});

//       test('does not return result if value is present', () => {
//         var oas = {
//           info: {
//             version: '5.0',
//             title: 'Some API',
//             description: 'A description',
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'truthy',
//           name: 'info-description',
//           path: '$.info',
//           enabled: true,
//           format: 'oas3',
//           description: 'info objects should have a description',
//           truthy: 'description',
//         };
//         const ruleB: types.LintRule = {
//           type: 'truthy',
//           name: 'info-version',
//           path: '$.info',
//           enabled: true,
//           format: 'oas3',
//           description: 'info objects should have a version',
//           truthy: 'version',
//         };

//         linter.registerRules([ruleA, ruleB]);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('alphabetical', () => {
//       test('returns result if values are not alphabetized', () => {
//         var oas = {
//           tags: [{ name: 'Foo', description: 'bar' }, { name: 'Bar', description: 'foo' }],
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'alphabetical',
//           name: 'openapi-tags-alphabetical',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'openapi object should have alphabetical tags',
//           alphabetical: {
//             properties: 'tags',
//             keyedBy: 'name',
//           },
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('openapi-tags-alphabetical');
//       });

//       test('does not return result if value is in alphabetical order', () => {
//         var oas = {
//           tags: [{ name: 'Bar', description: 'foo' }, { name: 'Foo', description: 'bar' }],
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'alphabetical',
//           name: 'openapi-tags-alphabetical',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'openapi object should have alphabetical tags',
//           alphabetical: {
//             properties: 'tags',
//             keyedBy: 'name',
//           },
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('or', () => {
//       test('returns result if no properties are present', () => {
//         var oas = {
//           description1: 'A description',
//           summary1: 'Yada yada yada',
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'or',
//           name: 'pathItem-summary-or-description',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'pathItem should have summary or description',
//           or: ['summary', 'description'],
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('pathItem-summary-or-description');
//       });

//       test('dont returns results if any properties are present', () => {
//         var oas = {
//           description: 'A description',
//           summary: 'Yada yada yada',
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'or',
//           name: 'pathItem-summary-or-description',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'pathItem should have summary or description',
//           or: ['something-else', 'summary'],
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('xor', () => {
//       test('returns result if no properties are present', () => {
//         var oas = {
//           description1: 'A description',
//           summary1: 'Yada yada yada',
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'xor',
//           name: 'pathItem-summary-or-description',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'pathItem should have summary or description',
//           xor: ['summary', 'description'],
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('pathItem-summary-or-description');
//       });

//       test('returns result if both properties are present', () => {
//         var oas = {
//           description: 'A description',
//           summary: 'Yada yada yada',
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'xor',
//           name: 'pathItem-summary-or-description',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'pathItem should have summary or description',
//           xor: ['summary', 'description'],
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('pathItem-summary-or-description');
//       });

//       test('dont returns results if one of the properties are present', () => {
//         var oas = {
//           description: 'A description',
//           summary: 'Yada yada yada',
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'or',
//           name: 'pathItem-summary-or-description',
//           path: '$',
//           enabled: true,
//           format: 'oas3',
//           description: 'pathItem should have summary or description',
//           or: ['something-else', 'summary'],
//         };

//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('pattern', () => {
//       test('returns result if pattern is not matched (on string)', () => {
//         var oas = {
//           responses: {
//             '401': {
//               description: '',
//               schema: {
//                 $ref: '#/definition?????s/error-response',
//               },
//             },
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'pattern',
//           name: 'reference-components-regex',
//           path: "$..['$ref']",
//           enabled: true,
//           format: 'oas3',
//           description: 'reference components should all match regex ^[a-zA-Z0-9\\.\\-_]+',
//           pattern: {
//             property: '$ref',
//             omit: '#',
//             split: '/',
//             value: '^[a-zA-Z0-9\\.\\-_]+$',
//           },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('reference-components-regex');
//       });

//       test('returns result if pattern is not matched (on object)', () => {
//         var oas = {
//           responses: {
//             '401a': {
//               description: '',
//               schema: {
//                 $ref: '#/definitions/error-response',
//               },
//             },
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'pattern',
//           name: 'all-responses-must-be-numeric',
//           path: '$..responses',
//           enabled: true,
//           format: 'oas3',
//           description: 'reference components should all match regex ^[0-9]+',
//           pattern: {
//             property: '*',
//             value: '^[0-9]+$',
//           },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('all-responses-must-be-numeric');
//       });

//       test('dont return result if pattern is matched', () => {
//         var oas = {
//           responses: {
//             '401': {
//               description: '',
//               schema: {
//                 $ref: '#/definitions/error-response',
//               },
//             },
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'pattern',
//           name: 'reference-components-regex',
//           path: "$..['$ref']",
//           enabled: true,
//           format: 'oas3',
//           description: 'reference components should all match regex ^[a-zA-Z0-9\\.\\-_]+',
//           pattern: {
//             property: '$ref',
//             omit: '#',
//             split: '/',
//             value: '^[a-zA-Z0-9\\.\\-_]+$',
//           },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('notContain', () => {
//       test('returns result if property contains value', () => {
//         var oas = {
//           swagger: '2.0',
//           info: {
//             version: '1.0',
//             title: 'To-do Demo',
//             description:
//               "### Notes:\n\nThis OAS2 (Swagger 2) specification defines common models and responses, that other specifications may reference.\n\nFor example, check out the user poperty in the main.oas2 todo-partial model - it references the user model in this specification!\n\nLikewise, the main.oas2 operations reference the shared error responses in this common specification.\n\n<script>console.log('sup homie');</script>",
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'notContain',
//           name: 'no-script-tags-in-markdown',
//           path: '$..*',
//           enabled: true,
//           format: 'oas3',
//           description: 'markdown descriptions should not contain <script> tags',
//           notContain: { properties: ['description'], value: '<script' },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('no-script-tags-in-markdown');
//       });

//       test('dont return results if property doesnt contain value', () => {
//         var oas = {
//           swagger: '2.0',
//           info: {
//             version: '1.0',
//             title: 'To-do Demo',
//             description:
//               '### Notes:\n\nThis OAS2 (Swagger 2) specification defines common models and responses, that other specifications may reference.\n\nFor example, check out the user poperty in the main.oas2 todo-partial model - it references the user model in this specification!\n\nLikewise, the main.oas2 operations reference the shared error responses in this common specification.',
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'notContain',
//           name: 'no-script-tags-in-markdown',
//           path: '$..*',
//           enabled: true,
//           format: 'oas3',
//           description: 'markdown descriptions should not contain <script> tags',
//           notContain: { properties: ['description'], value: '<script' },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('notEndWith', () => {
//       test('return result if property ends with value', () => {
//         var oas = {
//           openapi: '3.0.0',
//           info: {
//             version: '5.0',
//             title: 'Rooms API',
//           },
//           servers: [
//             {
//               url: 'http://localhost:5000/',
//               description: 'Development server',
//             },
//             {
//               url: 'https://rooms-staging.wework.com',
//               description: 'Staging server',
//             },
//           ],
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'notEndWith',
//           name: 'server-trailing-slash',
//           path: '$.servers',
//           enabled: true,
//           format: 'oas3',
//           description: 'server url should not have a trailing slash',
//           notEndWith: { property: 'url', value: '/' },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('server-trailing-slash');
//       });

//       test('dont return result if property doesnt end with value', () => {
//         var oas = {
//           openapi: '3.0.0',
//           info: {
//             version: '5.0',
//             title: 'Rooms API',
//           },
//           servers: [
//             {
//               url: 'http://localhost:5000',
//               description: 'Development server',
//             },
//             {
//               url: 'https://rooms-staging.wework.com',
//               description: 'Staging server',
//             },
//           ],
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'notEndWith',
//           name: 'server-trailing-slash',
//           path: '$.servers',
//           enabled: true,
//           format: 'oas3',
//           description: 'server url should not have a trailing slash',
//           notEndWith: { property: 'url', value: '/' },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//     describe('maxLength', () => {
//       test('return result if property is longer than value', () => {
//         var oas = {
//           paths: {
//             '/rooms/{room_id}/reserve/': {
//               post: {
//                 description: '',
//                 summary: 'Book Room Really fsdasddssdfgfdhdsafhsad fsad flong fjkdhfsds',
//               },
//             },
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'maxLength',
//           name: 'short-summary',
//           path: '$..summary',
//           enabled: true,
//           format: 'oas3',
//           description: 'summary should be short (description can be long)',
//           maxLength: {
//             value: 20,
//           },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(1);
//         expect(results[0].ruleName).toEqual('short-summary');
//       });

//       test('dont return result if property is shorter than value', () => {
//         var oas = {
//           paths: {
//             '/rooms/{room_id}/reserve/': {
//               post: {
//                 description: '',
//                 summary: 'Book Room Really',
//               },
//             },
//           },
//         };

//         const s = new Spectral(defaults);
//         const ruleA: types.LintRule = {
//           type: 'maxLength',
//           name: 'short-summary',
//           path: '$..summary',
//           enabled: true,
//           format: 'oas3',
//           description: 'summary should be short (description can be long)',
//           maxLength: {
//             value: 20,
//           },
//         };
//         linter.registerRule(ruleA);

//         const results = linter.lint(oas, 'oas3');
//         expect(results.length).toEqual(0);
//       });
//     });
//   });
// });
