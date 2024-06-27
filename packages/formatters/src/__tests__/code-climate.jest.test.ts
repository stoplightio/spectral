import { DiagnosticSeverity } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';
import { codeClimate } from '../code-climate';

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

describe('Code climate formatter', () => {
  test('should include ranges', () => {
    expect(JSON.parse(codeClimate(results, { failSeverity: DiagnosticSeverity.Error }))).toEqual([
      expect.objectContaining({
        location: {
          path: '__tests__/fixtures/petstore.oas2.yaml',
          positions: {
            begin: {
              line: 60,
              column: 8,
            },
            end: {
              line: 71,
              column: 60,
            },
          },
        },
      }),
      expect.objectContaining({
        location: {
          path: '__tests__/fixtures/petstore.oas2.yaml',
          positions: {
            begin: {
              line: 60,
              column: 8,
            },
            end: {
              line: 71,
              column: 60,
            },
          },
        },
      }),
    ]);
  });

  test('should include description', () => {
    expect(JSON.parse(codeClimate(results, { failSeverity: DiagnosticSeverity.Error }))).toEqual([
      expect.objectContaining({
        description: 'paths./pets.get.description is not truthy',
      }),
      expect.objectContaining({
        description: 'paths./pets.get.tags is not truthy',
      }),
    ]);
  });
});
