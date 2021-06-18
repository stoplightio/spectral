import { oas2 } from '@stoplight/spectral-formats';
import { truthy } from '@stoplight/spectral-functions';

import { Ruleset } from '../ruleset';
import { print } from './__helpers__/print';
import { RulesetDefinition, RulesetValidationError } from '@stoplight/spectral-core';

async function loadRuleset(mod: Promise<{ default: RulesetDefinition }>): Promise<Ruleset> {
  return new Ruleset((await mod).default);
}

describe('Ruleset', () => {
  describe('severity', () => {
    function getEnabledRules(rules: Ruleset['rules']) {
      return Object.keys(rules).filter(name => rules[name].enabled);
    }

    it('given ruleset with extends set to recommended, should enable recommended rules', async () => {
      const { rules } = await loadRuleset(import('./__fixtures__/severity/recommended'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'overridable-rule',
      ]);

      expect(rules).toStrictEqual((await loadRuleset(import('./__fixtures__/severity/implicit'))).rules);
    });

    it('given ruleset with extends set to all, should enable all rules but explicitly disabled', async () => {
      const { rules } = await loadRuleset(import('./__fixtures__/severity/all'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual([
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);
    });

    it('given ruleset with extends set to off, should disable all rules but explicitly enabled', async () => {
      const { rules } = await loadRuleset(import('./__fixtures__/severity/off'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual(['overridable-rule']);
    });

    it('given nested extends with severity set to off', async () => {
      const { rules } = await loadRuleset(import('./__fixtures__/severity/off-proxy'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual(['overridable-rule']);
    });

    it('given nested extends with severity set to off and explicit override to error', async () => {
      const { rules } = await loadRuleset(import('./__fixtures__/severity/error'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual(['description-matches-stoplight']);
    });
  });

  it('formats', async () => {
    expect(print(await loadRuleset(import('./__fixtures__/formats/ruleset'))))
      .toEqual(`├─ formats: OpenAPI 2.0 (Swagger), OpenAPI 3.x
└─ rules
   ├─ oas2-valid-rule
   │  ├─ name: oas2-valid-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ formats: OpenAPI 2.0 (Swagger)
   │  └─ severity: 1
   ├─ oas3-valid-rule
   │  ├─ name: oas3-valid-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ formats: OpenAPI 3.x
   │  └─ severity: 1
   └─ generic-valid-rule
      ├─ name: generic-valid-rule
      ├─ enabled: true
      ├─ inherited: false
      ├─ formats: OpenAPI 2.0 (Swagger), OpenAPI 3.x
      └─ severity: 1
`);

    expect(
      print({
        rules: {
          'generic-valid-rule': {
            formats: [oas2],
            given: '$.info',
            then: {
              function: truthy,
            },
          },
          'generic-valid-rule-2': {
            given: '$.info',
            then: {
              function: truthy,
            },
          },
        },
      }),
    ).toEqual(`├─ formats: OpenAPI 2.0 (Swagger)
└─ rules
   ├─ generic-valid-rule
   │  ├─ name: generic-valid-rule
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ formats: OpenAPI 2.0 (Swagger)
   │  └─ severity: 1
   └─ generic-valid-rule-2
      ├─ name: generic-valid-rule-2
      ├─ enabled: true
      ├─ inherited: false
      └─ severity: 1
`);
  });

  describe('circularity', () => {
    it('should handle direct circular extension', async () => {
      expect(print(await loadRuleset(import('./__fixtures__/circularity/direct')))).toEqual(`└─ rules
   └─ foo-rule
      ├─ name: foo-rule
      ├─ enabled: true
      ├─ inherited: false
      └─ severity: 1
`);
    });

    it('should handle indirect circular extension', async () => {
      expect(print(await loadRuleset(import('./__fixtures__/circularity/indirect.1')))).toEqual(`└─ rules
   ├─ baz-rule
   │  ├─ name: baz-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  └─ severity: 1
   ├─ bar-rule
   │  ├─ name: bar-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  └─ severity: 1
   └─ foo-rule
      ├─ name: foo-rule
      ├─ enabled: true
      ├─ inherited: false
      └─ severity: 1
`);
    });
  });

  describe('error handling', () => {
    it('given empty ruleset, should throw a user friendly error', () => {
      expect(
        () =>
          new Ruleset(
            // @ts-expect-error: invalid ruleset
            {},
          ),
      ).toThrowError(new RulesetValidationError('Ruleset must have rules or extends property'));
    });
  });

  it('should respect documentationUrl', async () => {
    const ruleset = {
      documentationUrl: 'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md',
      rules: {
        'foo-rule': {
          given: '$',
          then: {
            function() {
              return;
            },
          },
        },
        'bar-rule': {
          documentationUrl: 'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/bar-rule.md',
          given: '$',
          then: {
            function() {
              return;
            },
          },
        },
      },
    };

    expect(print(new Ruleset(ruleset))).toEqual(`└─ rules
   ├─ foo-rule
   │  ├─ name: foo-rule
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ severity: 1
   │  └─ documentationUrl: https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md#foo-rule
   └─ bar-rule
      ├─ name: bar-rule
      ├─ enabled: true
      ├─ inherited: false
      ├─ severity: 1
      └─ documentationUrl: https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/bar-rule.md
`);
  });

  it('should include parserOptions', async () => {
    const { parserOptions } = await loadRuleset(import('./__fixtures__/parser-options-ruleset'));

    expect(parserOptions).toStrictEqual({
      duplicateKeys: 'warn',
      incompatibleValues: 'off',
    });
  });
});
