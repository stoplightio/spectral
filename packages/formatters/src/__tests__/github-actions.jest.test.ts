import { DiagnosticSeverity } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';
import { githubActions } from '../github-actions';

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
    code: 'operation-summary',
    message: 'paths./pets.get.summary is too long',
    path: ['paths', '/pets', 'get', 'summary'],
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
];

const context = {
  ruleset: {
    rules: {
      'operation-description': {
        documentationUrl: '', // nothing
        owner: {
          definition: {
            documentationUrl: '', // nothing
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
      'operation-summary': {
        documentationUrl: 'https://rule-documentation-url.com',
        owner: {
          definition: {
            documentationUrl: 'https://ruleset-documentation-url.com',
          },
        },
      },
    },
  },
} as unknown as FormatterContext;

describe('GitHub Actions formatter', () => {
  test('should be formatted correctly', () => {
    expect(githubActions(results, { failSeverity: DiagnosticSeverity.Error }, context).split('\n')).toEqual([
      '::warning title=operation-description,file=__tests__/fixtures/petstore.oas2.yaml,col=9,endColumn=61,line=61,endLine=72::paths./pets.get.description is not truthy%0AMessage can have%0Amultiple lines',
      '::warning title=operation-tags,file=__tests__/fixtures/petstore.oas2.yaml,col=9,endColumn=61,line=61,endLine=72::paths./pets.get.tags is not truthy%0ADocumentation: https://ruleset-documentation-url.com#operation-tags',
      '::warning title=operation-summary,file=__tests__/fixtures/petstore.oas2.yaml,col=9,endColumn=61,line=61,endLine=72::paths./pets.get.summary is too long%0ADocumentation: https://rule-documentation-url.com',
    ]);
  });
});
