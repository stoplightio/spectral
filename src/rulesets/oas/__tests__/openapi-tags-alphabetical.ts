import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('openapi-tags-alphabetical', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['openapi-tags-alphabetical']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'a-tag' }, { name: 'b-tag' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags is not in alphabetical order', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'b-tag' }, { name: 'a-tag' }],
    });
    expect([...results]).toEqual([
      {
        code: 'openapi-tags-alphabetical',
        message: 'OpenAPI object should have alphabetical `tags`.',
        path: ['tags'],
        range: {
          end: {
            character: 21,
            line: 8,
          },
          start: {
            character: 9,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
