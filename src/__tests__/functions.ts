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
              field: '$.missing_prop',
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
              field: 'count',
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
            then: [
              {
                function: RuleFunction.TRUTHY,
                field: 'count',
              },
              {
                function: RuleFunction.TRUTHY,
                field: 'name',
              },
              {
                function: RuleFunction.TRUTHY,
                field: 'count2',
              },
            ],
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
              field: 'info',
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
              field: 'termsOfService',
              function: RuleFunction.PATTERN,
              functionOptions: {
                match: '^orange.*$',
              },
            },
          },
          {
            info: {
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
              field: '@key',
              function: RuleFunction.PATTERN,
              functionOptions: { match: '^[0-9]+$' },
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
            given: '$.info.termsOfService',
            then: {
              function: RuleFunction.PATTERN,
              functionOptions: {
                match: '^http.*$',
              },
            },
          },
          {
            info: {
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
              field: '@key',
              function: RuleFunction.PATTERN,
              functionOptions: { match: '^[0-9]+$' },
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

  describe('length', () => {
    const vals = [
      {
        val: '123',
      },
      {
        val: 3,
      },
      {
        val: [1, 2, 3],
      },
      {
        val: {
          one: 1,
          two: 2,
          three: 3,
        },
      },
    ];

    test('return result if string, number, array, or object is greater than max', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$..val',
            then: [
              {
                function: RuleFunction.LENGTH,
                functionOptions: { max: 2 },
              },
              {
                function: RuleFunction.LENGTH,
                functionOptions: { max: 3 },
              },
            ],
          },
          {
            vals,
          }
        ).length
      ).toEqual(4);
    });

    test('return result if string, number, array, or object is less than min', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$..val',
            then: [
              {
                function: RuleFunction.LENGTH,
                functionOptions: { min: 3 },
              },
              {
                function: RuleFunction.LENGTH,
                functionOptions: { min: 4 },
              },
            ],
          },
          {
            vals,
          }
        ).length
      ).toEqual(4);
    });

    test('dont return a result if string, number, array, or object is between min and max', () => {
      expect(
        applyRuleToObject(
          {
            summary: '',
            given: '$..val',
            then: {
              function: RuleFunction.LENGTH,
              functionOptions: { min: 3, max: 3 },
            },
          },
          {
            vals,
          }
        ).length
      ).toEqual(0);
    });
  });
});
