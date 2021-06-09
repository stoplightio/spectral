jest.mock?.('fs');

import { serveAssets } from '@stoplight/spectral-test-utils';

import { IRuleResult, Spectral } from '../../../spectral';
import type * as oasRuleset from '../../oas/index.json';
import type * as aasRuleset from '../../asyncapi/index.json';
import { STATIC_ASSETS } from '../../../assets';
import { empty } from '../../../utils';
import { isAsyncApiv2, isOpenApiv2, isOpenApiv3, isOpenApiv3_0, isOpenApiv3_1 } from '../../../formats';
import { Document } from '../../../document';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';

type Ruleset = typeof oasRuleset & typeof aasRuleset;
export type RuleName = keyof Ruleset['rules'];

type Scenario = ReadonlyArray<
  Readonly<{
    name: string;
    document: Record<string, unknown> | Document<unknown, any>;
    errors: ReadonlyArray<Partial<IRuleResult>>;
    mocks?: Record<string, Record<string, unknown>>;
  }>
>;

export default (ruleName: RuleName, tests: Scenario): void => {
  describe(`Rule ${ruleName}`, () => {
    const concurrent = tests.every(test => test.mocks === void 0 || Object.keys(test.mocks).length === 0);
    for (const testCase of tests) {
      (concurrent ? it.concurrent : it)(testCase.name, async () => {
        if (testCase.mocks !== void 0) {
          serveAssets(testCase.mocks);
        }

        const s = await createWithRules([ruleName]);
        const doc = testCase.document instanceof Document ? testCase.document : JSON.stringify(testCase.document);
        const errors = await s.run(doc);
        expect(errors.filter(({ code }) => code === ruleName)).toEqual(
          testCase.errors.map(error => expect.objectContaining(error) as unknown),
        );
      });
    }
  });
};

export async function createWithRules(rules: (keyof Ruleset['rules'])[]): Promise<Spectral> {
  try {
    Object.assign(STATIC_ASSETS, await import('../../../../rulesets/assets/assets.json'), {
      'my-ruleset': JSON.stringify({
        extends: [
          ['spectral:oas', 'off'],
          ['spectral:asyncapi', 'off'],
        ],
        rules: rules.reduce((obj, name) => {
          obj[name] = true;
          return obj;
        }, {}),
      }),
    });

    const s = new Spectral({ resolver: httpAndFileResolver });
    s.registerFormat('asyncapi2', isAsyncApiv2);
    s.registerFormat('oas2', isOpenApiv2);
    s.registerFormat('oas3', isOpenApiv3);
    s.registerFormat('oas3.0', isOpenApiv3_0);
    s.registerFormat('oas3.1', isOpenApiv3_1);

    await s.loadRuleset('my-ruleset');

    for (const rule of rules) {
      expect(s.rules[rule].severity).not.toEqual(-1);
    }

    return s;
  } finally {
    empty(STATIC_ASSETS);
  }
}
