import { Spectral } from '../spectral';
import { IRuleResult, Rule, RuleFunction, RuleType } from '../types';

const applyRuleToObject = (r: Rule, o: object): IRuleResult[] => {
  const s = new Spectral();
  s.setRules({
    testing: {
      'test:rule': r,
    },
  });
  return s.run(o, { format: 'testing' }).results;
};

describe('lint', () => {
  describe('rules', () => {
    describe('truthy', () => {
      test('returns result if value is not present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              given: '$.info',
              enabled: true,
              summary: '',
              input: {
                properties: 'something-not-present',
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

      test('doesnt return result if value is present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: 'version' },
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

    describe('alphabetical', () => {
      test('returns result if values are not alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.ALPHABETICAL,
              given: '$.info',
              enabled: true,
              summary: '',
              input: {
                properties: 'tags',
                keyedBy: 'name',
              },
            },
            {
              swagger: '2.0',
              info: {
                version: '1.0.0',
                title: 'Swagger Petstore',
                tags: [{ name: 'Far', description: 'bar' }, { name: 'Boo', description: 'foo' }],
              },
            }
          ).length
        ).toEqual(1);
      });

      test('dont return result if values are alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.ALPHABETICAL,
              given: '$.info',
              enabled: true,
              summary: '',
              input: {
                properties: 'tags',
                keyedBy: 'name',
              },
            },
            {
              swagger: '2.0',
              info: {
                version: '1.0.0',
                title: 'Swagger Petstore',
                tags: [{ name: 'Boo', description: 'bar' }, { name: 'Far', description: 'foo' }],
              },
            }
          ).length
        ).toEqual(0);
      });
    });

    describe('or', () => {
      test('returns result if no properties are present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.OR,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: ['something-not-present', 'something-else-not-present'] },
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
              type: RuleType.STYLE,
              function: RuleFunction.OR,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: ['version', 'something-else-not-present'] },
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
              type: RuleType.STYLE,
              function: RuleFunction.OR,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: ['version', 'title', 'termsOfService'] },
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
              type: RuleType.STYLE,
              function: RuleFunction.XOR,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: ['yada-yada', 'whatever'] },
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
              type: RuleType.STYLE,
              function: RuleFunction.XOR,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: ['version', 'title'] },
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
              type: RuleType.STYLE,
              function: RuleFunction.XOR,
              given: '$.info',
              enabled: true,
              summary: '',
              input: { properties: ['something', 'title'] },
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
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              given: '$.info',
              enabled: true,
              summary: '',
              input: {
                property: 'termsOfService',
                value: '^orange.*$',
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
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              given: '$.responses',
              enabled: true,
              summary: '',
              input: {
                property: '*',
                value: '^[0-9]+$',
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
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              given: '$.info',
              enabled: true,
              summary: '',
              input: {
                property: 'termsOfService',
                value: '^http.*$',
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
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              given: '$.responses',
              enabled: true,
              summary: '',
              input: {
                property: '*',
                value: '^[0-9]+$',
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
              type: RuleType.STYLE,
              function: RuleFunction.NOT_CONTAIN,
              given: '$..*',
              enabled: true,
              summary: '',
              input: { properties: ['description'], value: '<script' },
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
              type: RuleType.STYLE,
              function: RuleFunction.NOT_CONTAIN,
              given: '$..*',
              enabled: true,
              summary: '',
              input: { properties: ['description'], value: '<script' },
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
              type: RuleType.STYLE,
              function: RuleFunction.NOT_END_WITH,
              given: '$.servers',
              enabled: true,
              summary: '',
              input: { property: 'url', value: '/' },
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
              type: RuleType.STYLE,
              function: RuleFunction.NOT_END_WITH,
              given: '$.servers',
              enabled: true,
              summary: '',
              input: { property: 'url', value: '/' },
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
              type: RuleType.STYLE,
              function: RuleFunction.MAX_LENGTH,
              given: '$..summary',
              enabled: true,
              description: 'summary should be short (description can be long)',
              summary: '',
              input: {
                value: 20,
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
              type: RuleType.STYLE,
              function: RuleFunction.MAX_LENGTH,
              given: '$..summary',
              enabled: true,
              description: 'summary should be short (description can be long)',
              summary: '',
              input: {
                value: 20,
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
});
