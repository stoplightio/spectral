import { IRule } from '..';
import { Spectral } from '../spectral';
import { IRuleResult } from '../types';

const applyRuleToObject = async (r: IRule, o: object): Promise<IRuleResult[]> => {
  const s = new Spectral();
  s.setRules({
    testRule: r,
  });
  return await s.run(o);
};

describe('functions', () => {
  describe('pattern', () => {
    test('returns results if pattern is not matched (on string)', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$.info',
            then: {
              field: 'termsOfService',
              function: 'pattern',
              functionOptions: {
                match: '^orange.*$',
              },
            },
          },
          {
            info: {
              termsOfService: 'http://swagger.io/terms/',
            },
          },
        ),
      ).resolves.toHaveLength(1);
    });

    test('returns resolved if pattern is not matched (on object keys)', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$.responses',
            then: {
              field: '@key',
              function: 'pattern',
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
          },
        ),
      ).resolves.toHaveLength(1);
    });

    test('dont return resolved if pattern is matched (on string)', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$.info.termsOfService',
            then: {
              function: 'pattern',
              functionOptions: {
                match: '^http.*$',
              },
            },
          },
          {
            info: {
              termsOfService: 'http://swagger.io/terms/',
            },
          },
        ),
      ).resolves.toHaveLength(0);
    });

    test('dont return resolved if pattern is matched (on object keys)', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$.responses',
            then: {
              field: '@key',
              function: 'pattern',
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
          },
        ),
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

    test('return resolved if string, number, array, or object is greater than max', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$..val',
            then: [
              {
                function: 'length',
                functionOptions: { max: 2 },
              },
              {
                function: 'length',
                functionOptions: { max: 3 },
              },
            ],
          },
          {
            vals,
          },
        ),
      ).resolves.toHaveLength(4);
    });

    test('return resolved if string, number, array, or object is less than min', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$..val',
            then: [
              {
                function: 'length',
                functionOptions: { min: 3 },
              },
              {
                function: 'length',
                functionOptions: { min: 4 },
              },
            ],
          },
          {
            vals,
          },
        ),
      ).resolves.toHaveLength(4);
    });

    test('dont return a resolved if string, number, array, or object is between min and max', async () => {
      expect(
        applyRuleToObject(
          {
            message: '',
            given: '$..val',
            then: {
              function: 'length',
              functionOptions: { min: 3, max: 3 },
            },
          },
          {
            vals,
          },
        ),
      ).resolves.toHaveLength(0);
    });
  });
});
