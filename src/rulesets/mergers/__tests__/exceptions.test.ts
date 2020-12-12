import { escapeRegExp } from 'lodash';
import { RulesetExceptionCollection } from '../../../types/ruleset';
import { mergeExceptions } from '../exceptions';

import { buildRulesetExceptionCollectionFrom } from '../../../../setupTests';

describe('Ruleset exceptions merging', () => {
  describe('when loaded from a ruleset', () => {
    const dummyRulesetUri = './ruleset.yaml';

    it('includes new exceptions', () => {
      const target: RulesetExceptionCollection = {
        'file.yaml#/a': [],
        'file.yaml#/b': ['1', '2'],
        'file.yaml': ['1', '2'],
        '#/c': ['3', '4'],
      };

      const source: RulesetExceptionCollection = {
        'file.yaml': ['6'],
        'file.yaml#/c': ['3'],
        'file.yaml#/d': ['4', '5'],
        '#/c': ['7'],
      };

      mergeExceptions(target, source, dummyRulesetUri);

      expect(target).toEqual({
        '#/c': ['3', '4', '7'],
        'file.yaml': ['1', '2', '6'],
        'file.yaml#/a': [],
        'file.yaml#/b': ['1', '2'],
        'file.yaml#/c': ['3'],
        'file.yaml#/d': ['4', '5'],
      });
    });

    it('merges existing exceptions', () => {
      const target: RulesetExceptionCollection = {
        'file.yaml#/a': [],
        'file.yaml#/b': ['1', '3'],
      };

      const source: RulesetExceptionCollection = {
        'file.yaml#/a': ['0'],
        'file.yaml#/b': ['2', '4'],
      };

      mergeExceptions(target, source, dummyRulesetUri);

      expect(target).toEqual({
        'file.yaml#/a': ['0'],
        'file.yaml#/b': ['1', '2', '3', '4'],
      });
    });

    it('deduplicates exceptions', () => {
      const target: RulesetExceptionCollection = {
        'file.yaml#/a': [],
        'file.yaml#/b': ['1', '3'],
      };

      const source: RulesetExceptionCollection = {
        'file.yaml#/a': ['0', '0'],
        'file.yaml#/b': ['2', '4', '2', '3'],
      };

      mergeExceptions(target, source, dummyRulesetUri);

      expect(target).toEqual({
        'file.yaml#/a': ['0'],
        'file.yaml#/b': ['1', '2', '3', '4'],
      });
    });

    describe('Validation', () => {
      describe('Invalid locations', () => {
        const invalidLocations = ['##where', '#where', '../123.yaml#where'];

        it.each(invalidLocations)(
          'throws when locations are not valid uris (including fragment): "%s"',
          async location => {
            const source = buildRulesetExceptionCollectionFrom(location);

            expect(() => {
              mergeExceptions({}, source, dummyRulesetUri);
            }).toThrow(
              new RegExp(
                `.+\`${escapeRegExp(dummyRulesetUri)}\`.+\\(key \`${escapeRegExp(location)}\`.+is not a valid uri`,
              ),
            );
          },
        );
      });

      describe('throws on empty rules array', () => {
        const location = 'one.yaml#/';
        const source = buildRulesetExceptionCollectionFrom(location, []);

        expect(() => {
          mergeExceptions({}, source, dummyRulesetUri);
        }).toThrow(
          new RegExp(
            `.+\`${escapeRegExp(dummyRulesetUri)}\`.+\\(key \`${escapeRegExp(
              location,
            )}\`.+An empty array of rules has been provided`,
          ),
        );
      });

      describe('throws on empty rule name', () => {
        const location = 'one.yaml#/';
        const source = buildRulesetExceptionCollectionFrom(location, ['b', '']);

        expect(() => {
          mergeExceptions({}, source, dummyRulesetUri);
        }).toThrow(
          new RegExp(
            `.+\`${escapeRegExp(dummyRulesetUri)}\`.+\\(key \`${escapeRegExp(
              location,
            )}\`.+A rule with an empty name has been provided`,
          ),
        );
      });
    });

    describe('Normalization', () => {
      const relativeLocations: Array<[string, string, string]> = [
        ['./ruleset.yaml', '#/toto', '#/toto'],
        ['./ruleset.yaml', 'one.yaml#', 'one.yaml#'],
        ['./ruleset.yaml', 'one.yaml#/', 'one.yaml#/'],
        ['./ruleset.yaml', 'one.yaml', 'one.yaml'],
        ['./ruleset.yaml', 'one.yaml#/toto', 'one.yaml#/toto'],
        ['./ruleset.yaml', 'down/one.yaml#/toto', 'down/one.yaml#/toto'],
        ['./ruleset.yaml', '../one.yaml#/toto', '../one.yaml#/toto'],
        ['../ruleset.yaml', 'one.yaml#', '../one.yaml#'],
        ['../ruleset.yaml', 'one.yaml#/', '../one.yaml#/'],
        ['../ruleset.yaml', 'one.yaml#/toto', '../one.yaml#/toto'],
        ['../ruleset.yaml', 'down/one.yaml#/toto', '../down/one.yaml#/toto'],
        ['../ruleset.yaml', '../one.yaml#/toto', '../../one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', 'one.yaml#', 'https://dot.com/r/one.yaml#'],
        ['https://dot.com/r/ruleset.yaml', 'one.yaml#/', 'https://dot.com/r/one.yaml#/'],
        ['https://dot.com/r/ruleset.yaml', 'one.yaml#/toto', 'https://dot.com/r/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', 'down/one.yaml#/toto', 'https://dot.com/r/down/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', '../one.yaml#/toto', 'https://dot.com/one.yaml#/toto'],
      ];

      it.each(relativeLocations)(
        'combines relative locations with ruleset uri (ruleset: "%s", location: "%s")',
        (rulesetUri, location, expectedLocation) => {
          const source = buildRulesetExceptionCollectionFrom(location);
          const target = {};

          mergeExceptions(target, source, rulesetUri);

          const expected = buildRulesetExceptionCollectionFrom(expectedLocation);
          expect(target).toEqual(expected);
        },
      );

      const absoluteLocations: Array<[string, string, string]> = [
        ['./ruleset.yaml', 'https://dot.com/one.yaml#/toto', 'https://dot.com/one.yaml#/toto'],
        ['../ruleset.yaml', 'https://dot.com/one.yaml#/toto', 'https://dot.com/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', 'https://dot.com/one.yaml#/toto', 'https://dot.com/one.yaml#/toto'],
        ['./ruleset.yaml', '/local/one.yaml#/toto', '/local/one.yaml#/toto'],
        ['../ruleset.yaml', '/local/one.yaml#/toto', '/local/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', '/local/one.yaml#/toto', '/local/one.yaml#/toto'],
        ['./ruleset.yaml', 'c:/one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['../ruleset.yaml', 'c:/one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', 'c:/one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['./ruleset.yaml', 'c:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['../ruleset.yaml', 'c:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', 'c:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['./ruleset.yaml', 'C:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['../ruleset.yaml', 'C:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['https://dot.com/r/ruleset.yaml', 'C:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
      ];

      it.each(absoluteLocations)(
        'normalize absolute locations (ruleset: "%s", location: "%s")',
        (rulesetUri, location, expectedLocation) => {
          const source = buildRulesetExceptionCollectionFrom(location);
          const target = {};

          mergeExceptions(target, source, rulesetUri);

          const expected = buildRulesetExceptionCollectionFrom(expectedLocation);
          expect(target).toEqual(expected);
        },
      );
    });
  });
});
