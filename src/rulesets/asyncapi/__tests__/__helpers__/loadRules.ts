import { STATIC_ASSETS } from '../../../../assets';
import { empty } from '../../../../utils';
import { Spectral } from '../../../../spectral';
import { isAsyncApiv2 } from '../../../../formats';
import * as ruleset from '../../index.json';

export async function loadRules(rules: (keyof typeof ruleset['rules'])[]): Promise<Spectral> {
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
