import { Spectral } from '../index';
import { IRuleResult, IRuleset, Rule, RuleFunction, RuleType } from '../types';

const applyRuleToObject = (r: Rule, o: object): IRuleResult[] => {
  const cfg: IRuleset[] = [
    {
      rules: {
        testing: {
          'test:rule': r,
        },
      },
    },
  ];
  const s = new Spectral({ rulesets: cfg });
  return s.run({ target: o, spec: 'testing' });
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
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('doesnt return result if value is present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('alphabetical', () => {
      test('returns result if values are not alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.ALPHABETICAL,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('dont return result if values are alphabetized', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.ALPHABETICAL,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('or', () => {
      test('returns result if no properties are present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.OR,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('dont returns results if any properties are present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.OR,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.OR,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('xor', () => {
      test('returns result if no properties are present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.XOR,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('returns result if both properties are present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.XOR,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('dont returns results if one of the properties are present', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.XOR,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('pattern', () => {
      test('returns result if pattern is not matched (on string)', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('returns result if pattern is not matched (on object keys)', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              path: '$.responses',
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
          )
        ).toMatchSnapshot();
      });

      test('dont return result if pattern is matched (on string)', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              path: '$.info',
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
          )
        ).toMatchSnapshot();
      });

      test('dont return result if pattern is matched (on object keys)', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.PATTERN,
              path: '$.responses',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('notContain', () => {
      test('returns result if property contains value', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.NOT_CONTAIN,
              path: '$..*',
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
          )
        ).toMatchSnapshot();
      });

      test('dont return results if property doesnt contain value', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.NOT_CONTAIN,
              path: '$..*',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('notEndWith', () => {
      test('return result if property ends with value', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.NOT_END_WITH,
              path: '$.servers',
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
          )
        ).toMatchSnapshot();
      });

      test('dont return result if property doesnt end with value', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.NOT_END_WITH,
              path: '$.servers',
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
          )
        ).toMatchSnapshot();
      });
    });

    describe('maxLength', () => {
      test('return result if property is longer than value', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.MAX_LENGTH,
              path: '$..summary',
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
          )
        ).toMatchSnapshot();
      });

      test('dont return result if property is shorter than value', () => {
        expect(
          applyRuleToObject(
            {
              type: RuleType.STYLE,
              function: RuleFunction.MAX_LENGTH,
              path: '$..summary',
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
          )
        ).toMatchSnapshot();
      });
    });
  });
});
