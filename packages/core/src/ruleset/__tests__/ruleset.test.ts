import { oas2 } from '@stoplight/spectral-formats';
import { pattern, truthy } from '@stoplight/spectral-functions';
import * as path from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';

import { Ruleset } from '../ruleset';
import { RulesetDefinition } from '../types';
import { print } from './__helpers__/print';
import { RulesetValidationError } from '../validation';
import { isPlainObject } from '@stoplight/json';
import { Format } from '../format';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { FormatsSet } from '../utils/formatsSet';

async function loadRuleset(mod: Promise<{ default: RulesetDefinition }>, source?: string): Promise<Ruleset> {
  return new Ruleset((await mod).default, { source });
}

describe('Ruleset', () => {
  describe('severity', () => {
    function getEnabledRules(rules: Ruleset['rules']) {
      return Object.keys(rules).filter(name => rules[name].enabled);
    }

    it('given ruleset with extends set to recommended, should enable recommended rules', async () => {
      const ruleset = await loadRuleset(import('./__fixtures__/severity/recommended'));
      expect(Object.keys(ruleset.rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(ruleset.rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'overridable-rule',
      ]);

      expect(print(ruleset)).toEqual(print(await loadRuleset(import('./__fixtures__/severity/implicit'))));
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
    expect(print(await loadRuleset(import('./__fixtures__/formats/ruleset')))).toEqual(`├─ formats
│  ├─ 0: OpenAPI 2.0 (Swagger)
│  └─ 1: OpenAPI 3.x
└─ rules
   ├─ oas2-valid-rule
   │  ├─ name: oas2-valid-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ formats
   │  │  └─ 0: OpenAPI 2.0 (Swagger)
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   ├─ oas3-valid-rule
   │  ├─ name: oas3-valid-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ formats
   │  │  └─ 0: OpenAPI 3.x
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ generic-valid-rule
      ├─ name: generic-valid-rule
      ├─ enabled: true
      ├─ inherited: false
      ├─ formats
      │  ├─ 0: OpenAPI 2.0 (Swagger)
      │  └─ 1: OpenAPI 3.x
      ├─ given
      │  └─ 0: $.info
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
    ).toEqual(`├─ formats
│  └─ 0: OpenAPI 2.0 (Swagger)
└─ rules
   ├─ generic-valid-rule
   │  ├─ name: generic-valid-rule
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ formats
   │  │  └─ 0: OpenAPI 2.0 (Swagger)
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ generic-valid-rule-2
      ├─ name: generic-valid-rule-2
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $.info
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
      ├─ given
      │  └─ 0: $
      └─ severity: 1
`);
    });

    it('should handle indirect circular extension', async () => {
      expect(print(await loadRuleset(import('./__fixtures__/circularity/indirect.1')))).toEqual(`└─ rules
   ├─ baz-rule
   │  ├─ name: baz-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $
   │  └─ severity: 1
   ├─ bar-rule
   │  ├─ name: bar-rule
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $
   │  └─ severity: 1
   └─ foo-rule
      ├─ name: foo-rule
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $
      └─ severity: 1
`);
    });

    it('should be serializable', async () => {
      expect(JSON.parse(JSON.stringify(await loadRuleset(import('./__fixtures__/circularity/direct'))))).toEqual({
        id: expect.any(Number),
        source: null,
        aliases: null,
        extends: [],
        formats: null,
        overrides: null,
        parserOptions: {
          duplicateKeys: DiagnosticSeverity.Error,
          incompatibleValues: DiagnosticSeverity.Error,
        },
        rules: {
          'foo-rule': {
            description: null,
            documentationUrl: null,
            enabled: true,
            formats: null,
            given: ['$'],
            message: null,
            name: 'foo-rule',
            owner: expect.any(Number),
            recommended: true,
            resolved: true,
            severity: 1,
            then: [
              {
                function: 'falsy',
              },
            ],
          },
        },
      });
    });
  });

  describe('error handling', () => {
    it('given empty ruleset, should throw a user friendly error', () => {
      expect(() => new Ruleset({})).toThrowError(
        new RulesetValidationError('Ruleset must have rules or extends or overrides defined'),
      );
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
   │  ├─ given
   │  │  └─ 0: $
   │  ├─ severity: 1
   │  └─ documentationUrl: https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md#foo-rule
   └─ bar-rule
      ├─ name: bar-rule
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $
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

  describe('overrides', () => {
    const cwd = path.join(__dirname, './__fixtures__/overrides/');

    it('given no overrides, should return the initial ruleset', async () => {
      const ruleset = await loadRuleset(import('./__fixtures__/overrides/_base'), path.join(cwd, 'hierarchy'));

      expect(ruleset.fromSource(null)).toBe(ruleset);
    });

    it('given a ruleset with overrides only, should consider rule as empty for unmatched files', async () => {
      const ruleset = await loadRuleset(
        import('./__fixtures__/overrides/only-overrides'),
        path.join(cwd, 'only-overrides'),
      );

      expect(ruleset.rules).toEqual({});
      expect(ruleset.fromSource(path.join(cwd, 'spec.yaml')).rules).toEqual({});
    });

    it('given a ruleset with rules only, should apply overrides', async () => {
      const ruleset = await loadRuleset(import('./__fixtures__/overrides/only-rules'), path.join(cwd, 'only-rules'));

      expect(print(ruleset)).toEqual(print(await loadRuleset(import('./__fixtures__/overrides/_base'))));

      expect(print(ruleset)).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: false
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);

      expect(print(ruleset.fromSource(path.join(cwd, 'unmatched/spec.json')))).toEqual(print(ruleset));

      expect(print(ruleset.fromSource(path.join(cwd, 'legacy/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: -1
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);

      expect(print(ruleset.fromSource(path.join(cwd, 'legacy/test/spec.json')))).toEqual(
        print(ruleset.fromSource(path.join(cwd, 'legacy/spec.json'))),
      );

      expect(print(ruleset.fromSource(path.join(cwd, 'v2/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 3
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
    });

    it('should respect the hierarchy of overrides', async () => {
      const ruleset = await loadRuleset(import('./__fixtures__/overrides/hierarchy'), path.join(cwd, 'hierarchy'));

      expect(print(ruleset)).toEqual(print(await loadRuleset(import('./__fixtures__/overrides/_base'))));

      expect(print(ruleset)).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: false
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);

      expect(print(ruleset.fromSource(path.join(cwd, 'unmatched/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 2
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: -1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);

      expect(print(ruleset.fromSource(path.join(cwd, 'legacy/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 2
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: -1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: true
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
      expect(print(ruleset.fromSource(path.join(cwd, 'legacy/test/spec.json')))).toEqual(
        print(ruleset.fromSource(path.join(cwd, 'legacy/spec.json'))),
      );

      expect(print(ruleset.fromSource(path.join(cwd, 'v2/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 2
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: -1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
    });

    it('should be serializable', async () => {
      const ruleset = await loadRuleset(import('./__fixtures__/overrides/serializing'), path.join(cwd, 'serializing'));

      expect(JSON.parse(JSON.stringify(ruleset))).toEqual({
        id: expect.any(Number),
        source: path.join(cwd, 'serializing'),
        aliases: null,
        extends: null,
        formats: null,
        overrides: [
          {
            files: ['legacy/**/*.json'],
            rules: {
              'contact-name-matches-stoplight': true,
              'description-matches-stoplight': 'off',
              'title-matches-stoplight': 'warn',
            },
          },
          {
            files: ['v2/**/*.json'],
            rules: {
              'description-matches-stoplight': 'error',
              'title-matches-stoplight': 'hint',
            },
          },
          {
            files: ['**/*.json'],
            rules: {
              'description-matches-stoplight': 'info',
              'title-matches-stoplight': 'off',
            },
          },
        ],
        parserOptions: {
          duplicateKeys: DiagnosticSeverity.Error,
          incompatibleValues: DiagnosticSeverity.Error,
        },
        rules: {
          'contact-name-matches-stoplight': {
            description: null,
            documentationUrl: null,
            enabled: false,
            formats: null,
            given: ['$.info.contact'],
            message: 'Contact name must contain Stoplight',
            name: 'contact-name-matches-stoplight',
            owner: expect.any(Number),
            recommended: false,
            resolved: true,
            severity: DiagnosticSeverity.Warning,
            then: [
              {
                function: 'pattern',
                functionOptions: 'Object{}',
              },
            ],
          },
          'description-matches-stoplight': {
            description: null,
            documentationUrl: null,
            enabled: true,
            formats: null,
            given: ['$.info'],
            message: 'Description must contain Stoplight',
            name: 'description-matches-stoplight',
            owner: expect.any(Number),
            recommended: true,
            resolved: true,
            severity: DiagnosticSeverity.Error,
            then: [
              {
                function: 'pattern',
                functionOptions: 'Object{}',
              },
            ],
          },
          'title-matches-stoplight': {
            description: null,
            documentationUrl: null,
            enabled: true,
            formats: null,
            given: ['$.info'],
            message: 'Title must contain Stoplight',
            name: 'title-matches-stoplight',
            owner: expect.any(Number),
            recommended: true,
            resolved: true,
            severity: DiagnosticSeverity.Warning,
            then: [
              {
                function: 'pattern',
                functionOptions: 'Object{}',
              },
            ],
          },
        },
      });
    });

    it('should support new rule definitions', async () => {
      const ruleset = await loadRuleset(
        import('./__fixtures__/overrides/new-definitions'),
        path.join(cwd, 'new-definitions'),
      );

      expect(print(ruleset.fromSource(path.join(cwd, 'legacy/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   ├─ contact-name-matches-stoplight
   │  ├─ name: contact-name-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info.contact
   │  └─ severity: 1
   └─ value-matches-stoplight
      ├─ name: value-matches-stoplight
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $..value
      └─ severity: 0
`);

      expect(print(ruleset.fromSource(path.join(cwd, 'legacy/test/spec.json')))).toEqual(
        print(ruleset.fromSource(path.join(cwd, 'legacy/spec.json'))),
      );

      expect(print(ruleset.fromSource(path.join(cwd, 'v2/spec.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
    });

    it('should respect parserOptions', async () => {
      const ruleset = await loadRuleset(
        import('./__fixtures__/overrides/parser-options'),
        path.join(cwd, 'parser-options'),
      );

      expect(ruleset.fromSource(path.join(cwd, 'document.json')).parserOptions).toStrictEqual({
        duplicateKeys: DiagnosticSeverity.Error,
        incompatibleValues: DiagnosticSeverity.Error,
      });

      expect(ruleset.fromSource(path.join(cwd, 'legacy/apis/document.json')).parserOptions).toStrictEqual({
        duplicateKeys: DiagnosticSeverity.Error,
        incompatibleValues: DiagnosticSeverity.Hint,
      });

      expect(ruleset.fromSource(path.join(cwd, 'v2/document.json')).parserOptions).toStrictEqual({
        incompatibleValues: DiagnosticSeverity.Warning,
        duplicateKeys: DiagnosticSeverity.Information,
      });
    });

    it('should respect formats', async () => {
      const ruleset = await loadRuleset(import('./__fixtures__/overrides/formats'), path.join(cwd, 'formats'));

      expect(print(ruleset.fromSource(path.join(cwd, 'schemas/common/user.draft7.json')))).toEqual(`├─ formats
│  └─ 0: JSON Schema Draft 7
└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   ├─ contact-name-matches-stoplight
   │  ├─ name: contact-name-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info.contact
   │  └─ severity: 1
   └─ valid-number-validation
      ├─ name: valid-number-validation
      ├─ enabled: true
      ├─ inherited: false
      ├─ formats
      │  └─ 0: JSON Schema Draft 7
      ├─ given
      │  ├─ 0: $..exclusiveMinimum
      │  └─ 1: $..exclusiveMaximum
      └─ severity: 1
`);

      expect(print(ruleset.fromSource(path.join(cwd, 'schemas/user.draft4.json')))).toEqual(`├─ formats
│  └─ 0: JSON Schema Draft 4
└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   ├─ contact-name-matches-stoplight
   │  ├─ name: contact-name-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info.contact
   │  └─ severity: 1
   └─ valid-number-validation
      ├─ name: valid-number-validation
      ├─ enabled: true
      ├─ inherited: false
      ├─ formats
      │  └─ 0: JSON Schema Draft 4
      ├─ given
      │  ├─ 0: $..exclusiveMinimum
      │  └─ 1: $..exclusiveMaximum
      └─ severity: 1
`);
    });

    describe('aliases', () => {
      const cwd = path.join(__dirname, './__fixtures__/overrides/aliases');

      it('given locally defined aliases, should merge them same as rules', async () => {
        const ruleset = await loadRuleset(import('./__fixtures__/overrides/aliases/scope'), path.join(cwd, 'scope'));

        expect(print(ruleset.fromSource(path.join(cwd, 'document.json')))).toEqual(`└─ rules
   └─ truthy-stoplight-property
      ├─ name: truthy-stoplight-property
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $..value
      └─ severity: 0
`);

        expect(print(ruleset.fromSource(path.join(cwd, 'legacy/document.json')))).toEqual(`└─ rules
   ├─ truthy-stoplight-property
   │  ├─ name: truthy-stoplight-property
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $..value
   │  └─ severity: 0
   └─ falsy-value
      ├─ name: falsy-value
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $..value
      └─ severity: 1
`);

        expect(print(ruleset.fromSource(path.join(cwd, 'document.yaml')))).toEqual(`└─ rules
   └─ value-matches-stoplight
      ├─ name: value-matches-stoplight
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $..stoplight
      └─ severity: 0
`);
      });
    });

    describe('extends', () => {
      const cwd = path.join(__dirname, './__fixtures__/overrides/extends');

      it('given local extend with severity set to all, should mark all rules as enabled for matching files', async () => {
        const ruleset = await loadRuleset(import('./__fixtures__/overrides/extends/all'), path.join(cwd, 'all'));

        expect(print(ruleset.fromSource(path.join(cwd, 'document.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: true
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
      });

      it('given multiple extends, should merge them respecting the hierarchy', async () => {
        const ruleset = await loadRuleset(
          import('./__fixtures__/overrides/extends/multiple-extends'),
          path.join(cwd, 'multiple-extends'),
        );

        expect(print(ruleset.fromSource(path.join(cwd, 'document.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: true
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);

        expect(print(ruleset.fromSource(path.join(cwd, 'v2/document.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
      });

      it('given presence of extends in both the ruleset and the override, should always prioritize the override', async () => {
        const ruleset = await loadRuleset(import('./__fixtures__/overrides/extends/both'), path.join(cwd, 'both'));

        expect(print(ruleset.fromSource(path.join(cwd, 'document.json')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: true
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: true
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);

        expect(print(ruleset.fromSource(path.join(cwd, 'v2/document.json')))).toEqual(
          print(ruleset.fromSource(path.join(cwd, 'document.json'))),
        );

        expect(print(ruleset.fromSource(path.join(cwd, 'document.yaml')))).toEqual(`└─ rules
   ├─ description-matches-stoplight
   │  ├─ name: description-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 0
   ├─ title-matches-stoplight
   │  ├─ name: title-matches-stoplight
   │  ├─ enabled: false
   │  ├─ inherited: true
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   └─ contact-name-matches-stoplight
      ├─ name: contact-name-matches-stoplight
      ├─ enabled: false
      ├─ inherited: true
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
      });

      describe('error handling', () => {
        it('given document with no source, should throw an error', async () => {
          const ruleset = await loadRuleset(import('./__fixtures__/overrides/hierarchy'), path.join(cwd, 'hierarchy'));

          expect(ruleset.fromSource.bind(ruleset, null)).toThrowError(
            Error(
              'Document must have some source assigned. If you use Spectral programmatically make sure to pass the source to Document',
            ),
          );
        });

        it('given ruleset with no source, should throw an error', async () => {
          const ruleset = await loadRuleset(import('./__fixtures__/overrides/hierarchy'));

          expect(ruleset.fromSource.bind(ruleset, path.join(cwd, 'v2/spec.json'))).toThrowError(
            Error(
              'Ruleset must have some source assigned. If you use Spectral programmatically make sure to pass the source to Ruleset',
            ),
          );
        });

        it('given no local or extended rule, should throw an error', async () => {
          const ruleset = await loadRuleset(
            import('./__fixtures__/overrides/new-definitions-error'),
            path.join(cwd, 'new-definitions-error'),
          );

          expect(ruleset.fromSource.bind(ruleset, path.join(cwd, 'v2/spec.json'))).toThrowError(
            ReferenceError('Cannot extend non-existing rule: "new-definition"'),
          );
        });
      });
    });
  });

  describe('aliases', () => {
    it('should resolve locally defined aliases', () => {
      expect(
        print(
          new Ruleset({
            aliases: {
              Info: '$.info',
              PathItem: '$.paths[*][*]',
              Description: '$..description',
              Name: '$..name',
            },

            rules: {
              'valid-path': {
                given: '#PathItem',
                then: {
                  function: truthy,
                },
              },

              'valid-name-and-description': {
                given: ['#Name', '#Description'],
                then: {
                  function: truthy,
                },
              },

              'valid-contact': {
                given: '#Info.contact',
                then: {
                  function: truthy,
                },
              },
            },
          }),
        ),
      ).toEqual(`└─ rules
   ├─ valid-path
   │  ├─ name: valid-path
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $.paths[*][*]
   │  └─ severity: 1
   ├─ valid-name-and-description
   │  ├─ name: valid-name-and-description
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  ├─ 0: $..name
   │  │  └─ 1: $..description
   │  └─ severity: 1
   └─ valid-contact
      ├─ name: valid-contact
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
    });

    it('should be serializable', () => {
      expect(
        JSON.parse(
          JSON.stringify(
            new Ruleset({
              aliases: {
                Info: '$.info',
                PathItem: '$.paths[*][*]',
                Description: '$..description',
                Name: '$..name',
              },

              rules: {
                'valid-path': {
                  given: '#PathItem',
                  then: {
                    function: truthy,
                  },
                },

                'valid-name-and-description': {
                  given: ['#Name', '#Description'],
                  then: {
                    function: truthy,
                  },
                },

                'valid-contact': {
                  given: '#Info.contact',
                  then: {
                    function: truthy,
                  },
                },
              },
            }),
          ),
        ),
      ).toEqual({
        extends: null,
        source: null,
        id: expect.any(Number),
        formats: null,
        overrides: null,
        parserOptions: {
          duplicateKeys: DiagnosticSeverity.Error,
          incompatibleValues: DiagnosticSeverity.Error,
        },
        aliases: {
          Info: '$.info',
          PathItem: '$.paths[*][*]',
          Description: '$..description',
          Name: '$..name',
        },
        rules: {
          'valid-path': {
            description: null,
            documentationUrl: null,
            enabled: true,
            formats: null,
            given: ['#PathItem'],
            message: null,
            name: 'valid-path',
            owner: expect.any(Number),
            recommended: true,
            resolved: true,
            severity: DiagnosticSeverity.Warning,
            then: [
              {
                function: 'truthy',
              },
            ],
          },

          'valid-name-and-description': {
            description: null,
            documentationUrl: null,
            enabled: true,
            formats: null,
            given: ['#Name', '#Description'],
            message: null,
            name: 'valid-name-and-description',
            owner: expect.any(Number),
            recommended: true,
            resolved: true,
            severity: DiagnosticSeverity.Warning,
            then: [
              {
                function: 'truthy',
              },
            ],
          },

          'valid-contact': {
            description: null,
            documentationUrl: null,
            enabled: true,
            formats: null,
            given: ['#Info.contact'],
            message: null,
            name: 'valid-contact',
            owner: expect.any(Number),
            recommended: true,
            resolved: true,
            severity: DiagnosticSeverity.Warning,
            then: [
              {
                function: 'truthy',
              },
            ],
          },
        },
      });
    });

    it('should resolve nested aliases', () => {
      expect(
        print(
          new Ruleset({
            aliases: {
              Info: '$.info',
              InfoDescription: '#Info.description',
              InfoContact: '#Info.contact',
              InfoContactName: '#InfoContact.name',
            },

            rules: {
              'valid-info': {
                given: '#Info',
                then: {
                  function: truthy,
                },
              },

              'valid-name-and-description': {
                given: ['#InfoContactName', '#InfoDescription'],
                then: {
                  function: truthy,
                },
              },

              'valid-contact': {
                given: '#InfoContact',
                then: {
                  function: truthy,
                },
              },
            },
          }),
        ),
      ).toEqual(`└─ rules
   ├─ valid-info
   │  ├─ name: valid-info
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  └─ 0: $.info
   │  └─ severity: 1
   ├─ valid-name-and-description
   │  ├─ name: valid-name-and-description
   │  ├─ enabled: true
   │  ├─ inherited: false
   │  ├─ given
   │  │  ├─ 0: $.info.contact.name
   │  │  └─ 1: $.info.description
   │  └─ severity: 1
   └─ valid-contact
      ├─ name: valid-contact
      ├─ enabled: true
      ├─ inherited: false
      ├─ given
      │  └─ 0: $.info.contact
      └─ severity: 1
`);
    });

    it('given unresolved alias, should throw', () => {
      expect(
        () =>
          new Ruleset({
            extends: {
              aliases: {
                PathItem: '$.paths[*][*]',
              },
              rules: {},
            },
            rules: {
              'valid-path': {
                given: '#PathItem-',
                then: {
                  function: truthy,
                },
              },
            },
          }),
      ).toThrowError(ReferenceError('Alias "PathItem-" does not exist'));
    });

    it('given circular alias, should throw', () => {
      expect(
        () =>
          new Ruleset({
            aliases: {
              Root: '#Info',
              Info: '#Root.test',
              Contact: '#Info',
              Test: '#Contact.test',
            },
            rules: {
              'valid-path': {
                given: '#Test',
                then: {
                  function: truthy,
                },
              },
            },
          }),
      ).toThrowError(
        ReferenceError('Alias "Test" is circular. Resolution stack: Test -> Contact -> Info -> Root -> Info'),
      );
    });

    it('should refuse to resolve externally defined aliases', () => {
      expect(
        () =>
          new Ruleset({
            extends: {
              aliases: {
                PathItem: '$.paths[*][*]',
                Description: '$..description',
                Name: '$..name',
              },
              rules: {},
            },
            rules: {
              'valid-path': {
                given: '#PathItem',
                then: {
                  function: truthy,
                },
              },

              'valid-name-and-description': {
                given: ['#Name', '#Description'],
                then: {
                  function: truthy,
                },
              },
            },
          }),
      ).toThrowError(ReferenceError('Alias "PathItem" does not exist'));
    });

    describe('scoped aliases', () => {
      it('should resolve locally defined aliases according to their targets', () => {
        const draft4: Format<JSONSchema4> = (input): input is JSONSchema4 =>
          isPlainObject(input) && input.$schema === 'http://json-schema.org/draft-04/schema#';
        const draft6: Format<JSONSchema6> = (input): input is JSONSchema6 =>
          isPlainObject(input) && input.$schema === 'http://json-schema.org/draft-06/schema#';
        const draft7: Format<JSONSchema7> = (input): input is JSONSchema7 =>
          isPlainObject(input) && input.$schema === 'http://json-schema.org/draft-07/schema#';

        const ruleset = new Ruleset({
          aliases: {
            Id: {
              targets: [
                {
                  formats: [draft4],
                  given: '$..id',
                },
                {
                  formats: [draft6, draft7],
                  given: '$..$id',
                },
              ],
            },
          },
          rules: {
            'valid-id': {
              given: '#Id',
              then: {
                function: pattern,
                functionOptions: {
                  match: '^project_',
                },
              },
            },
          },
        });

        expect(ruleset.rules['valid-id'].getGivenForFormats(new FormatsSet([draft4]))).toStrictEqual(['$..id']);
        expect(ruleset.rules['valid-id'].getGivenForFormats(new FormatsSet([draft6]))).toStrictEqual(['$..$id']);
        expect(ruleset.rules['valid-id'].getGivenForFormats(new FormatsSet([draft7]))).toStrictEqual(['$..$id']);
        expect(ruleset.rules['valid-id'].getGivenForFormats(new FormatsSet([draft6, draft7]))).toStrictEqual([
          '$..$id',
        ]);
      });

      it('should be serializable', () => {
        const draft4: Format<JSONSchema4> = (input): input is JSONSchema4 =>
          isPlainObject(input) && input.$schema === 'http://json-schema.org/draft-04/schema#';
        const draft6: Format<JSONSchema6> = (input): input is JSONSchema6 =>
          isPlainObject(input) && input.$schema === 'http://json-schema.org/draft-06/schema#';
        const draft7: Format<JSONSchema7> = (input): input is JSONSchema7 =>
          isPlainObject(input) && input.$schema === 'http://json-schema.org/draft-07/schema#';

        expect(
          JSON.parse(
            JSON.stringify(
              new Ruleset({
                aliases: {
                  Id: {
                    targets: [
                      {
                        formats: [draft4],
                        given: '$..id',
                      },
                      {
                        formats: [draft6, draft7],
                        given: '$..$id',
                      },
                    ],
                  },
                },

                rules: {
                  'valid-id': {
                    given: '#Id',
                    then: {
                      function: truthy,
                    },
                  },
                },
              }),
            ),
          ),
        ).toEqual({
          extends: null,
          source: null,
          id: expect.any(Number),
          formats: null,
          overrides: null,
          parserOptions: {
            duplicateKeys: DiagnosticSeverity.Error,
            incompatibleValues: DiagnosticSeverity.Error,
          },
          aliases: {
            Id: {
              targets: [
                {
                  formats: ['draft4'],
                  given: '$..id',
                },
                {
                  formats: ['draft6', 'draft7'],
                  given: '$..$id',
                },
              ],
            },
          },
          rules: {
            'valid-id': {
              description: null,
              documentationUrl: null,
              enabled: true,
              formats: null,
              given: ['#Id'],
              message: null,
              name: 'valid-id',
              owner: expect.any(Number),
              recommended: true,
              resolved: true,
              severity: DiagnosticSeverity.Warning,
              then: [
                {
                  function: 'truthy',
                },
              ],
            },
          },
        });
      });
    });
  });
});
