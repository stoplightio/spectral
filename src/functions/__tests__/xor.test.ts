import { IRule, IRuleResult, Spectral } from '../..';

const applyRuleToObject = async (rule: IRule, doc: Record<string, unknown>): Promise<IRuleResult[]> => {
  const s = new Spectral();
  s.setRules({ rule });
  return [...(await s.run(doc))];
};

describe('xor', () => {
  test('returns resolved if no properties are present', async () => {
    return expect(
      applyRuleToObject(
        {
          given: '$',
          then: {
            function: 'xor',
            functionOptions: { properties: ['yada-yada', 'whatever'] },
          },
        },
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        code: 'rule',
        message: '"yada-yada" and "whatever" must not be both defined or both undefined',
        path: [],
      }),
    ]);
  });

  test('returns resolved if both properties are present', async () => {
    return expect(
      applyRuleToObject(
        {
          given: '$',
          then: {
            function: 'xor',
            functionOptions: { properties: ['version', 'title'] },
          },
        },
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        code: 'rule',
        message: '"version" and "title" must not be both defined or both undefined',
        path: [],
      }),
    ]);
  });

  test('returns resolved if the value is not an object', async () => {
    return expect(
      applyRuleToObject(
        {
          given: '$.info',
          then: {
            function: 'xor',
            functionOptions: { properties: ['version', 'title'] },
          },
        },
        {
          info: null,
        },
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        code: 'rule',
        message: '`info` property must be an object',
        path: ['info'],
      }),
    ]);
  });

  test('passes when only one of the properties are present', async () => {
    return expect(
      applyRuleToObject(
        {
          given: '$',
          then: {
            function: 'xor',
            functionOptions: { properties: ['something', 'title'] },
          },
        },
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
      ),
    ).resolves.toHaveLength(0);
  });
});
