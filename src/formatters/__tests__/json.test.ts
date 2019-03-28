import { IRuleResult } from '../../../dist/types';
import { json } from '../json';

const results: IRuleResult[] = [
  {
    code: 'operation-description',
    summary: 'Operation `description` must be present and non-empty string.',
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
    summary: 'Operation should have non-empty `tags` array.',
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
];

describe('JSON formatter', () => {
  test('should include ranges', () => {
    expect(JSON.parse(json(results))).toEqual([
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

  test('should include summary', () => {
    expect(JSON.parse(json(results))).toEqual([
      expect.objectContaining({
        summary: 'Operation `description` must be present and non-empty string.',
      }),
      expect.objectContaining({
        summary: 'Operation should have non-empty `tags` array.',
      }),
    ]);
  });
});
