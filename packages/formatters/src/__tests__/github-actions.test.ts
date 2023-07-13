import { DiagnosticSeverity } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';
import { githubActions } from '../github-actions';

const cwd = process.cwd();
const results: IRuleResult[] = [
  {
    code: 'operation-description',
    message: 'paths./pets.get.description is not truthy',
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
];

describe('GitHub Actions formatter', () => {
  test('should be formatted correctly', () => {
    expect(githubActions(results, { failSeverity: DiagnosticSeverity.Error }).split('\n')).toEqual([
      '::warning title=operation-description,file=__tests__/fixtures/petstore.oas2.yaml,col=8,endColumn=60,line=60,endLine=71::paths./pets.get.description is not truthy',
      '::warning title=operation-tags,file=__tests__/fixtures/petstore.oas2.yaml,col=8,endColumn=60,line=60,endLine=71::paths./pets.get.tags is not truthy',
    ]);
  });
});
