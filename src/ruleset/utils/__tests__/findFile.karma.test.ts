import { findFile } from '../findFile';

describe('Rulesets finder', () => {
  it('should point to unpkg.com if npm module', () => {
    return expect(findFile('', '@stoplight/spectral/rulesets/oas/index.json')).resolves.toEqual(
      'https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json',
    );
  });

  it(`should support spectral built-in ruleset shorthand`, () => {
    return expect(findFile('', `spectral:oas`)).resolves.toEqual(
      `https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json`,
    );
  });

  it(`should resolve spectral built-in ruleset shorthand even if a base uri is provided`, () => {
    return expect(findFile('https://localhost:4000', `spectral:oas`)).resolves.toEqual(
      `https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json`,
    );
  });
});
