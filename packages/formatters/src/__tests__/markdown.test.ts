import { DiagnosticSeverity } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';
import { FormatterContext } from '../types';
import { markdown } from '../markdown';

const results: IRuleResult[] = [
  {
    code: 'operation-description',
    message: 'paths./pets.get.description is not truthy',
    path: ['paths', '/pets', 'get', 'description'],
    severity: DiagnosticSeverity.Error,
    source: './src/__tests__/fixtures/petstore.oas2.yaml',
    range: {
      start: {
        line: 1,
        character: 0,
      },
      end: {
        line: 10,
        character: 1,
      },
    },
  },
  {
    code: 'operation-tags',
    message: 'paths./pets.get.tags is not truthy',
    path: ['paths', '/pets', 'get', 'tags'],
    severity: DiagnosticSeverity.Warning,
    source: './src/__tests__/fixtures/petstore.oas2.yaml',
    range: {
      start: {
        line: 11,
        character: 0,
      },
      end: {
        line: 20,
        character: 1,
      },
    },
  },
  {
    code: 'rule-from-other-ruleset',
    message: 'i should not have any documentation url link',
    path: ['paths'],
    severity: DiagnosticSeverity.Warning,
    source: './src/__tests__/fixtures/petstore.oas2.yaml',
    range: {
      start: {
        line: 21,
        character: 0,
      },
      end: {
        line: 30,
        character: 1,
      },
    },
  },
];

const context = {
  ruleset: {
    rules: {
      'operation-description': {
        documentationUrl: 'https://rule-documentation-url.com',
        owner: {
          definition: {
            documentationUrl: 'https://ruleset-documentation-url.com',
          },
        },
      },
      'operation-tags': {
        documentationUrl: '', //nothing
        owner: {
          definition: {
            documentationUrl: 'https://ruleset-documentation-url.com',
          },
        },
      },
      'rule-from-other-ruleset': {
        documentationUrl: '', //nothing
        owner: {
          definition: {
            documentationUrl: '', //nothing
          },
        },
      },
    },
  },
} as unknown as FormatterContext;

const expectedMd = String.raw`
| Code                                                                   | Path                         | Message                                      | Severity | Start | End  | Source                                              |
| ---------------------------------------------------------------------- | ---------------------------- | -------------------------------------------- | -------- | ----- | ---- | --------------------------------------------------- |
| [operation-description](https://rule-documentation-url.com)            | paths.\/pets.get.description | paths.\/pets.get.description is not truthy   | Error    | 1:0   | 10:1 | .\/src\/\_\_tests\_\_\/fixtures\/petstore.oas2.yaml |
| [operation-tags](https://ruleset-documentation-url.com#operation-tags) | paths.\/pets.get.tags        | paths.\/pets.get.tags is not truthy          | Warning  | 11:0  | 20:1 | .\/src\/\_\_tests\_\_\/fixtures\/petstore.oas2.yaml |
| rule-from-other-ruleset                                                | paths                        | i should not have any documentation url link | Warning  | 21:0  | 30:1 | .\/src\/\_\_tests\_\_\/fixtures\/petstore.oas2.yaml |
`;

describe('Markdown formatter', () => {
  test('should format as markdown table', () => {
    const CRLF = '\r\n';
    const md = markdown(results, { failSeverity: DiagnosticSeverity.Warning }, context);

    // We normalize the line-breaks and trailing whitespaces because the expected markdown file is can be created on a Windows machine
    // and prettier instert a line break automatically
    const normalizedMd = md.replace(new RegExp(CRLF, 'g'), '\n').trim();
    const normalizedExpectedMd = expectedMd.replace(new RegExp(CRLF, 'g'), '\n').trim();

    expect(normalizedMd).toEqual(normalizedExpectedMd);
  });
});
