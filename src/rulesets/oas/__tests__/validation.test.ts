import { Spectral } from '../../../index';
import { commonOasRuleset } from '../index';

const ruleset = commonOasRuleset();

describe('oas', () => {
  describe('validation', () => {
    test('pathParam', () => {
      const s = new Spectral({
        rulesets: [
          {
            functions: ruleset.functions,
            rules: {
              oas2: {
                'path-params': Object.assign(ruleset.rules['oas2|oas3']['path-params'], {
                  enabled: true,
                }),
              },
            },
          },
        ],
      });

      let results = s.run({
        spec: 'oas2',
        target: {
          paths: {
            '/foo': {
              get: {},
            },
          },
        },
      });
      expect(results.length).toEqual(0);

      results = s.run({
        spec: 'oas2',
        target: {
          paths: {
            '/foo/{bar}': {
              get: {},
            },
          },
        },
      });
      expect(results.length).toEqual(1);
      expect(results[0].path).toEqual(['$', 'paths', '/foo/{bar}']);
      expect(results[0].message).toContain('bar');

      results = s.run({
        spec: 'oas2',
        target: {
          paths: {
            '/foo/{bar}': {
              parameters: [
                {
                  name: 'bar',
                  in: 'path',
                },
              ],
              get: {},
            },
          },
        },
      });
      expect(results.length).toEqual(0);

      results = s.run({
        spec: 'oas2',
        target: {
          paths: {
            '/foo/{bar}': {
              get: {
                parameters: [
                  {
                    name: 'bar',
                    in: 'path',
                  },
                ],
              },
            },
          },
        },
      });
      expect(results.length).toEqual(0);

      results = s.run({
        spec: 'oas2',
        target: {
          paths: {
            '/foo/{bar}': {
              parameters: [
                {
                  name: 'bar',
                  in: 'path',
                },
              ],
              get: {
                parameters: [
                  {
                    name: 'bar',
                    in: 'path',
                  },
                ],
              },
            },
          },
        },
      });
      expect(results.length).toEqual(1);
      expect(results[0].message).toContain('bar');

      results = s.run({
        spec: 'oas2',
        target: {
          paths: {
            '/foo/{bar}/{bar}': {
              parameters: [
                {
                  name: 'bar',
                  in: 'path',
                },
              ],
              get: {},
            },
          },
        },
      });
      expect(results.length).toEqual(1);
      expect(results[0].message).toContain('bar');
    });
  });
});
