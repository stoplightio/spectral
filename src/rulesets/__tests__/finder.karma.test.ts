import { findRuleset } from '../finder';

describe('Rulesets finder', () => {
  it('should point to unpkg.com if npm module', () => {
    return expect(findRuleset('', '@stoplight/spectral/rulesets/oas2/index.json')).resolves.toEqual(
      'https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json',
    );
  });

  for (const shorthand of ['oas', 'oas2', 'oas3']) {
    it(`should support spectral built-in ${shorthand} ruleset shorthand`, () => {
      return expect(findRuleset('', `spectral:${shorthand}`)).resolves.toEqual(
        `https://unpkg.com/@stoplight/spectral/rulesets/${shorthand}/index.json`,
      );
    });
  }
});
