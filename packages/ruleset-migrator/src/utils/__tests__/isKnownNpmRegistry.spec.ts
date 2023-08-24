import { isKnownNpmRegistry } from '../isKnownNpmRegistry';

describe('isKnownNmRegistry util', () => {
  it.each([
    'https://unpkg.com/spectral-aws-apigateway-ruleset',
    'https://unpkg.com/spectral-aws-apigateway-ruleset/functions/draft4.js',
    'https://cdn.skypack.dev/@stoplight/spectral-core',
  ])('given recognized %s registry, should return true', input => {
    expect(isKnownNpmRegistry(input)).toBe(true);
  });

  it.each([
    'ftp://unpkg.com/spectral-aws-apigateway-ruleset',
    '/nimma/legacy',
    'https://baz.unpkg.com/spectral-aws-apigateway-ruleset',
  ])('given unrecognized %s entity, should return false', input => {
    expect(isKnownNpmRegistry(input)).toBe(false);
  });
});
