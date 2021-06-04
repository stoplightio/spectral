import { DiagnosticSeverity } from '@stoplight/types';
import { IRuleResult } from '../../../types';
import { sortResults } from '../../../utils';
import { json } from '../json';

const results: IRuleResult[] = sortResults([
  {
    code: 'operation-description',
    message: 'paths./pets.get.description is not truthy',
    path: ['paths', '/pets', 'get', 'description'],
    severity: 1,
    source: '/home/Stoplight/spectral/yaml/src/__tests__/fixtures/petstore.oas2.yaml',
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
    source: '/home/Stoplight/spectral/yaml/src/__tests__/fixtures/petstore.oas2.yaml',
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
]);

describe('JSON formatter', () => {
  it('should include ranges', () => {
    expect(JSON.parse(json(results, { failSeverity: DiagnosticSeverity.Error }))).toEqual([
      expect.objectContaining({
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
      }),
      expect.objectContaining({
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
      }),
    ]);
  });

  it('should include message', () => {
    expect(JSON.parse(json(results, { failSeverity: DiagnosticSeverity.Error }))).toEqual([
      expect.objectContaining({
        message: 'paths./pets.get.description is not truthy',
      }),
      expect.objectContaining({
        message: 'paths./pets.get.tags is not truthy',
      }),
    ]);
  });
});
