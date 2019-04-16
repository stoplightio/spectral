import { pick } from 'lodash';
import { spectralRules } from '..';
import { Spectral } from '../../../spectral';
import { noUndefRule } from '../schemaToRuleCollection';

describe('Spectral Rules', () => {
  const rules = spectralRules();
  let spectral: Spectral;

  ['given', 'then'].forEach(field => {
    test(`rule is missing '${field}'`, async () => {
      spectral = new Spectral();
      spectral.addRules(pick(rules, noUndefRule(field)));

      const results = await spectral.run({
        rules: [
          {
            [field]: 'value',
          },
          {
            // field is missing
          },
        ],
      });
      expect(results).toMatchSnapshot();
    });
  });
});
