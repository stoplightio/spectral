import { IRule } from '..';
import { Spectral } from '../spectral';
import { IRuleResult } from '../types';

const applyRuleToObject = async (r: IRule, o: Record<string, unknown>): Promise<IRuleResult[]> => {
  const s = new Spectral();
  s.setRules({
    testRule: r,
  });
  return await s.run(o);
};

describe('functions', () => {
  describe('pattern', () => {
    test('returns results if pattern is not matched (on string)', async () => {
      await expect(
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
      await expect(
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
      await expect(
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
      await expect(
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
});
