import { DiagnosticSeverity } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';
import { sarif, sarifToolVersion } from '../sarif';

const cwd = process.cwd();
const results: IRuleResult[] = [
  {
    code: 'operation-description',
    message: 'paths./pets.get.description is not truthy\nMessage can have\nmultiple lines',
    path: ['paths', '/pets', 'get', 'description'],
    severity: 1,
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
    severity: 0,
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
  test('should be formatted correctly', () => {
    const output = sarif(results, { failSeverity: DiagnosticSeverity.Error });
    const outputObject = JSON.parse(output);
    const expectedObject = JSON.parse(`
    {
      "$schema": "http://json.schemastore.org/sarif-2.1.0-rtm.6.json",
      "version": "2.1.0",
      "runs": [
        {
          "tool": {
            "driver": {
              "name": "spectral",
              "rules": [
                {
                  "id": "operation-description",
                  "shortDescription": {
                    "text": "paths./pets.get.description is not truthy\\nMessage can have\\nmultiple lines"
                  }
                },
                {
                  "id": "operation-tags",
                  "shortDescription": {
                    "text": "paths./pets.get.tags is not truthy"
                  }
                }
              ],
              "version": "${sarifToolVersion}",
              "informationUri": "https://github.com/stoplightio/spectral"
            }
          },
          "results": [
            {
              "level": "warning",
              "message": {
                "text": "paths./pets.get.description is not truthy\\nMessage can have\\nmultiple lines"
              },
              "ruleId": "operation-description",
              "locations": [
                {
                  "physicalLocation": {
                    "artifactLocation": {
                      "uri": "__tests__/fixtures/petstore.oas2.yaml",
                      "index": 0
                    },
                    "region": {
                      "startLine": 61,
                      "startColumn": 8,
                      "endLine": 72,
                      "endColumn": 60
                    }
                  }
                }
              ],
              "ruleIndex": 0
            },
            {
              "level": "error",
              "message": {
                "text": "paths./pets.get.tags is not truthy"
              },
              "ruleId": "operation-tags",
              "locations": [
                {
                  "physicalLocation": {
                    "artifactLocation": {
                      "uri": "__tests__/fixtures/petstore.oas2.yaml",
                      "index": 0
                    },
                    "region": {
                      "startLine": 61,
                      "startColumn": 8,
                      "endLine": 72,
                      "endColumn": 60
                    }
                  }
                }
              ],
              "ruleIndex": 1
            }
          ],
          "artifacts": [
            {
              "sourceLanguage": "YAML",
              "location": {
                "uri": "__tests__/fixtures/petstore.oas2.yaml"
              }
            }
          ]
        }
      ]
    }`);
    expect(outputObject).toEqual(expectedObject);
  });
});
