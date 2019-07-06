import { findRuleset } from '../finder';

describe('Rulesets finder', () => {
  it('should point to unpkg.com if npm module', () => {
    return expect(findRuleset('', '@stoplight/spectral/rulesets/oas2/index.json')).resolves.toEqual(
      'https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json',
    );
  });
});
