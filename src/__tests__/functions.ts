import { Spectral } from '../spectral';
import { IRuleResult, Rule, RuleFunction } from '../types';

const applyRuleToObject = (r: Rule, o: object): IRuleResult[] => {
  const s = new Spectral();
  s.addRules({
    testRule: r,
  });
  return s.run(o).results;
};

describe('functions', () => {
  describe('truthy', () => {
    test('returns result if value is not present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.TRUTHY,
              functionOptions: { properties: 'something-not-present' },
            },
          },
          {
            info: {
              version: '1.0.0',
            },
          }
        ).length
      ).toEqual(1);
    });

    test('returns result if value is not truthy', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$',
            then: {
              function: RuleFunction.TRUTHY,
              functionOptions: { properties: 'count' },
            },
          },
          {
            count: 0,
          }
        ).length
      ).toEqual(1);
    });

    test('returns results for multiple properties', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$',
            then: {
              function: RuleFunction.TRUTHY,
              functionOptions: { properties: ['count', 'name', 'count2'] },
            },
          },
          {
            count: 0,
            name: 'joe',
            count2: 0,
          }
        ).length
      ).toEqual(2);
    });

    test('doesnt return result if value is present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$',
            then: {
              function: RuleFunction.TRUTHY,
              functionOptions: { properties: 'info' },
            },
          },
          {
            info: {
              version: '1.0.0',
            },
          }
        ).length
      ).toEqual(0);
    });
  });

  describe('alphabetical', () => {
    describe('arrays', () => {
      test('returns result if value keys are not alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              summary: '',
              given: '$.info',
              then: {
                field: 'tags',
                function: RuleFunction.ALPHABETICAL,
                functionOptions: { keyedBy: 'name' },
              },
            },
            {
              info: {
                tags: [{ name: 'Far', description: 'bar' }, { name: 'Boo', description: 'foo' }],
              },
            }
          ).length
        ).toEqual(1);
      });

      test('dont return result if value keys are alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              summary: '',
              given: '$.info.tags',
              then: {
                function: RuleFunction.ALPHABETICAL,
                functionOptions: { keyedBy: 'name' },
              },
            },
            {
              info: {
                tags: [{ name: 'Boo', description: 'bar' }, { name: 'Far', description: 'foo' }],
              },
            }
          ).length
        ).toEqual(0);
      });

      test('return results if values are alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              summary: '',
              given: '$.info',
              then: {
                field: 'tags',
                function: RuleFunction.ALPHABETICAL,
              },
            },
            {
              info: {
                tags: ['b', 'a'],
              },
            }
          ).length
        ).toEqual(1);
      });
    });

    describe('objects', () => {
      test('returns result if array values are not alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              summary: '',
              given: '$.info',
              then: {
                function: RuleFunction.ALPHABETICAL,
              },
            },
            {
              info: {
                b: true,
                a: true,
              },
            }
          ).length
        ).toEqual(1);
      });

      test('dont return result if object values are alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              summary: '',
              given: '$',
              then: {
                field: 'info',
                function: RuleFunction.ALPHABETICAL,
              },
            },
            {
              info: {
                a: true,
                b: true,
              },
            }
          ).length
        ).toEqual(0);
      });
    });
  });

  describe('or', () => {
    test('returns result if no properties are present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.OR,
              functionOptions: {
                properties: ['something-not-present', 'something-else-not-present'],
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
            },
          }
        ).length
      ).toEqual(1);
    });

    test('dont returns results if any properties are present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.OR,
              functionOptions: {
                properties: ['version', 'something-else-not-present'],
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
            },
          }
        ).length
      ).toEqual(0);
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.OR,
              functionOptions: {
                properties: ['version', 'title', 'termsOfService'],
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
              termsOfService: 'http://swagger.io/terms/',
            },
          }
        ).length
      ).toEqual(0);
    });
  });

  describe('xor', () => {
    test('returns result if no properties are present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.XOR,
              functionOptions: { properties: ['yada-yada', 'whatever'] },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
              termsOfService: 'http://swagger.io/terms/',
            },
          }
        ).length
      ).toEqual(1);
    });

    test('returns result if both properties are present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.XOR,
              functionOptions: { properties: ['version', 'title'] },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
              termsOfService: 'http://swagger.io/terms/',
            },
          }
        ).length
      ).toEqual(1);
    });

    test('dont returns results if one of the properties are present', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.XOR,
              functionOptions: { properties: ['something', 'title'] },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
              termsOfService: 'http://swagger.io/terms/',
            },
          }
        ).length
      ).toEqual(0);
    });
  });

  describe('pattern', () => {
    test('returns result if pattern is not matched (on string)', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.PATTERN,
              functionOptions: {
                property: 'termsOfService',
                value: '^orange.*$',
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
              termsOfService: 'http://swagger.io/terms/',
            },
          }
        ).length
      ).toEqual(1);
    });

    test('returns result if pattern is not matched (on object keys)', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.responses',
            then: {
              function: RuleFunction.PATTERN,
              functionOptions: { property: '*', value: '^[0-9]+$' },
            },
          },
          {
            responses: {
              '123': {
                test: 'something',
              },
              '456avbas': {
                test: 'something',
              },
              '789': {
                test: 'something',
              },
            },
          }
        ).length
      ).toEqual(1);
    });

    test('dont return result if pattern is matched (on string)', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.info',
            then: {
              function: RuleFunction.PATTERN,
              functionOptions: {
                property: 'termsOfService',
                value: '^http.*$',
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0.0',
              title: 'Swagger Petstore',
              termsOfService: 'http://swagger.io/terms/',
            },
          }
        ).length
      ).toEqual(0);
    });

    test('dont return result if pattern is matched (on object keys)', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.responses',
            then: {
              function: RuleFunction.PATTERN,
              functionOptions: { property: '*', value: '^[0-9]+$' },
            },
          },
          {
            responses: {
              '123': {
                test: 'something',
              },
              '456': {
                test: 'something',
              },
              '789': {
                test: 'something',
              },
            },
          }
        ).length
      ).toEqual(0);
    });
  });

  describe('notContain', () => {
    test('returns result if property contains value', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$..*',
            then: {
              function: RuleFunction.NOT_CONTAIN,
              functionOptions: {
                properties: ['description'],
                value: '<script',
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0',
              title: 'To-do Demo',
              description:
                "### Notes:\n\nThis OAS2 (Swagger 2) specification defines common models and responses, that other specifications may reference.\n\nFor example, check out the user poperty in the main.oas2 todo-partial model - it references the user model in this specification!\n\nLikewise, the main.oas2 operations reference the shared error responses in this common specification.\n\n<script>console.log('sup homie');</script>",
            },
          }
        ).length
      ).toEqual(1);
    });

    test('dont return results if property doesnt contain value', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$..*',
            then: {
              function: RuleFunction.NOT_CONTAIN,
              functionOptions: {
                properties: ['description'],
                value: '<script',
              },
            },
          },
          {
            swagger: '2.0',
            info: {
              version: '1.0',
              title: 'To-do Demo',
              description:
                '### Notes:\n\nThis OAS2 (Swagger 2) specification defines common models and responses, that other specifications may reference.\n\nFor example, check out the user poperty in the main.oas2 todo-partial model - it references the user model in this specification!\n\nLikewise, the main.oas2 operations reference the shared error responses in this common specification.',
            },
          }
        ).length
      ).toEqual(0);
    });
  });

  describe('notEndWith', () => {
    test('return result if property ends with value', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.servers',
            then: {
              function: RuleFunction.NOT_END_WITH,
              functionOptions: { property: 'url', value: '/' },
            },
          },
          {
            swagger: '2.0',
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
          }
        ).length
      ).toEqual(1);
    });

    test('dont return result if property doesnt end with value', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$.servers',
            then: {
              function: RuleFunction.NOT_END_WITH,
              functionOptions: { property: 'url', value: '/' },
            },
          },
          {
            swagger: '2.0',
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
          }
        ).length
      ).toEqual(0);
    });
  });

  describe('maxLength', () => {
    test('return result if property is longer than value', () => {
      expect(
        applyRuleToObject(
          {
            summary: 'summary should be short (description can be long)',
            given: '$..summary',
            then: {
              function: RuleFunction.MAX_LENGTH,
              functionOptions: { value: 20 },
            },
          },
          {
            paths: {
              '/rooms/{room_id}/reserve/': {
                post: {
                  summary: 'Book Room Really fsdasddssdfgfdhdsafhsad fsad flong fjkdhfsds',
                },
              },
            },
          }
        ).length
      ).toEqual(1);
    });

    test('dont return result if property is shorter than value', () => {
      expect(
        applyRuleToObject(
          {
            summary: 'summary should be short (description can be long)',
            given: '$..summary',
            then: {
              function: RuleFunction.MAX_LENGTH,
              functionOptions: { value: 20 },
            },
          },
          {
            paths: {
              '/rooms/{room_id}/reserve/': {
                post: {
                  summary: 'Book',
                },
              },
            },
          }
        ).length
      ).toEqual(0);
    });
  });
});
