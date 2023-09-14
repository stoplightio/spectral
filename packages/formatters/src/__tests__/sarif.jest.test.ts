import { DiagnosticSeverity } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';
import { Ruleset } from '@stoplight/spectral-core';
import { sarif } from '../sarif';

const cwd = process.cwd();
const results: IRuleResult[] = [
  {
    code: 'operation-description',
    message: 'paths./pets.get.description is not truthy\nMessages can differ from the rule description',
    path: ['paths', '/pets', 'get', 'description'],
    severity: DiagnosticSeverity.Warning,
    source: `${cwd}/__tests__/fixtures/petstore.oas2.yaml`,
    range: {
      start: {
        line: 60,
        character: 8,
      },
      end: {
        line: 71,
        character: 60,
      },
    },
  },
  {
    code: 'operation-tags',
    message: 'paths./pets.get.tags is not truthy',
    path: ['paths', '/pets', 'get', 'tags'],
    severity: DiagnosticSeverity.Error,
    source: `${cwd}/__tests__/fixtures/petstore.oas2.yaml`,
    range: {
      start: {
        line: 60,
        character: 8,
      },
      end: {
        line: 71,
        character: 60,
      },
    },
  },
];

describe('Sarif formatter', () => {
  test('should be formatted correctly', async () => {
    const sarifToolVersion = '6.11';
    const ruleset = new Ruleset({
      rules: {
        'operation-description': {
          description: 'paths./pets.get.description is not truthy',
          message: 'paths./pets.get.description is not truthy\nMessages can differ from the rule description',
          severity: DiagnosticSeverity.Error,
          given: '$.paths[*][*]',
          then: {
            field: 'description',
            function: function truthy() {
              return false;
            },
          },
        },
        'operation-tags': {
          description: 'paths./pets.get.tags is not truthy',
          message: 'paths./pets.get.tags is not truthy\nMessages can differ from the rule description',
          severity: DiagnosticSeverity.Error,
          given: '$.paths[*][*]',
          then: {
            field: 'description',
            function: function truthy() {
              return false;
            },
          },
        },
      },
    });

    const output = sarif(
      results,
      { failSeverity: DiagnosticSeverity.Error },
      { ruleset, spectralVersion: sarifToolVersion },
    );

    const outputObject = JSON.parse(output);
    expect(outputObject).toStrictEqual({
      $schema: 'http://json.schemastore.org/sarif-2.1.0-rtm.6.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'spectral',
              rules: [
                {
                  id: 'operation-description',
                  shortDescription: {
                    text: 'paths./pets.get.description is not truthy',
                  },
                },
                {
                  id: 'operation-tags',
                  shortDescription: {
                    text: 'paths./pets.get.tags is not truthy',
                  },
                },
              ],
              version: sarifToolVersion,
              informationUri: 'https://github.com/stoplightio/spectral',
            },
          },
          results: [
            {
              level: 'warning',
              message: {
                text: 'paths./pets.get.description is not truthy\nMessages can differ from the rule description',
              },
              ruleId: 'operation-description',
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: '__tests__/fixtures/petstore.oas2.yaml',
                      index: 0,
                    },
                    region: {
                      startLine: 61,
                      startColumn: 9,
                      endLine: 72,
                      endColumn: 61,
                    },
                  },
                },
              ],
              ruleIndex: 0,
            },
            {
              level: 'error',
              message: {
                text: 'paths./pets.get.tags is not truthy',
              },
              ruleId: 'operation-tags',
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: '__tests__/fixtures/petstore.oas2.yaml',
                      index: 0,
                    },
                    region: {
                      startLine: 61,
                      startColumn: 9,
                      endLine: 72,
                      endColumn: 61,
                    },
                  },
                },
              ],
              ruleIndex: 1,
            },
          ],
          artifacts: [
            {
              sourceLanguage: 'YAML',
              location: {
                uri: '__tests__/fixtures/petstore.oas2.yaml',
              },
            },
          ],
        },
      ],
    });
  });
});
