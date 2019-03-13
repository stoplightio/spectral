import { Spectral } from '../spectral';
import { IRuleResult, Rule, RuleFunction } from '../types';

const applyRuleToObject = async (r: Rule, o: object): Promise<IRuleResult[]> => {
  const s = new Spectral();
  s.addRules({
    testRule: r,
  });
  return (await s.run(o)).results;
};

describe('functions', () => {
  describe('xor', () => {
    test('returns result if no properties are present', async () => {
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
        )
      ).resolves.toHaveLength(1);
    });

    test('returns result if both properties are present', async () => {
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
        )
      ).resolves.toHaveLength(1);
    });

    test('dont returns results if one of the properties are present', async () => {
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
        )
      ).resolves.toHaveLength(0);
    });
  });

  describe('pattern', () => {
    test('returns result if pattern is not matched (on string)', async () => {
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
        )
      ).resolves.toHaveLength(1);
    });

    test('returns result if pattern is not matched (on object keys)', async () => {
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
        )
      ).resolves.toHaveLength(1);
    });

    test('dont return result if pattern is matched (on string)', async () => {
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
        )
      ).resolves.toHaveLength(0);
    });

    test('dont return result if pattern is matched (on object keys)', async () => {
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
        )
      ).resolves.toHaveLength(0);
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

    test('return result if string, number, array, or object is greater than max', async () => {
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
        )
      ).resolves.toHaveLength(4);
    });

    test('return result if string, number, array, or object is less than min', async () => {
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
        )
      ).resolves.toHaveLength(4);
    });

    test('dont return a result if string, number, array, or object is between min and max', async () => {
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
        )
      ).resolves.toHaveLength(0);
    });
  });
});
