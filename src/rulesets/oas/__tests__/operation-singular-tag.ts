import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('operation-singular-tag', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['operation-singular-tag']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: ['todos'],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags has more than 1', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: ['todos', 'private'],
          },
        },
      },
    });
    expect([...results]).toEqual([
      {
        code: 'operation-singular-tag',
        message: 'Operation may only have one tag.',
        path: ['paths', '/todos', 'get', 'tags'],
        range: {
          end: {
            character: 19,
            line: 7,
          },
          start: {
            character: 15,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
