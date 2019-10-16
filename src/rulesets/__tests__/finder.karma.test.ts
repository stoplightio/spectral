import { findFile } from '../finder';

describe('Rulesets finder', () => {
  it('should point to unpkg.com if npm module', () => {
    return expect(findFile('', '@stoplight/spectral/rulesets/oas2/index.json')).resolves.toEqual(
      'https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json',
    );
  });

  for (const shorthand of ['oas', 'oas2', 'oas3']) {
    it(`should support spectral built-in ${shorthand} ruleset shorthand`, () => {
      return expect(findFile('', `spectral:${shorthand}`)).resolves.toEqual(
        `https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json`,
      );
    });

    it(`should resolve spectral built-in ${shorthand} ruleset shorthand even if a base uri is provided`, () => {
      return expect(findFile('https://localhost:4000', `spectral:${shorthand}`)).resolves.toEqual(
        `https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json`,
      );
    });
  }
});
