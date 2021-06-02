import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('openapi-tags', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['openapi-tags']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'todos' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing tags', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });
    expect([...results]).toEqual([
      {
        code: 'openapi-tags',
        message: 'OpenAPI object should have non-empty `tags` array.',
        path: [],
        range: {
          end: {
            character: 13,
            line: 2,
          },
          start: {
            character: 0,
            line: 0,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return errors if empty tags', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [],
    });
    expect([...results]).toEqual([
      {
        code: 'openapi-tags',
        message: 'OpenAPI object should have non-empty `tags` array.',
        path: ['tags'],
        range: {
          start: {
            character: 9,
            line: 3,
          },
          end: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
