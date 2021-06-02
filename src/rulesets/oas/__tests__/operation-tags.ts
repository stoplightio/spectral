import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('operation-tags', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['operation-tags']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: [{ name: 'todos' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect([...results]).toEqual([
      {
        code: 'operation-tags',
        message: 'Operation should have non-empty `tags` array.',
        path: ['paths', '/todos', 'get'],
        range: {
          end: {
            character: 15,
            line: 4,
          },
          start: {
            character: 12,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
