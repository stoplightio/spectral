import { IRuleResult, Spectral } from '../../../../spectral';
import * as ruleset from '../../index.json';
import { STATIC_ASSETS } from '../../../../assets';
import { empty } from '../../../../utils';
import { isAsyncApiv2 } from '../../../../formats';

type Scenario = ReadonlyArray<
  Readonly<{
    name: string;
    document: Record<string, unknown>;
    errors: ReadonlyArray<Partial<IRuleResult>>;
  }>
>;

export default (ruleName: keyof typeof ruleset['rules'], tests: Scenario): void => {
  describe(`AsyncAPI: rule ${ruleName}`, () => {
    it.concurrent.each(tests)('%name', async testCase => {
      const s = await createWithRules([ruleName]);
      const doc = JSON.stringify(testCase.document);
      expect([...(await s.run(doc))]).toEqual(testCase.errors.map(error => expect.objectContaining(error) as unknown));
    });
  });
};

async function createWithRules(rules: (keyof typeof ruleset['rules'])[]): Promise<Spectral> {
  try {
    Object.assign(STATIC_ASSETS, await import('../../../../../rulesets/assets/assets.asyncapi.json'), {
      'my-ruleset': JSON.stringify({
        extends: [['spectral:asyncapi', 'off']],
        rules: rules.reduce((obj, name) => {
          obj[name] = true;
          return obj;
        }, {}),
      }),
    });

    const s = new Spectral();
    s.registerFormat('asyncapi2', isAsyncApiv2);

    await s.loadRuleset('my-ruleset');

    for (const rule of rules) {
      expect(s.rules[rule].severity).not.toEqual(-1);
    }

    return s;
  } finally {
    empty(STATIC_ASSETS);
  }
}
