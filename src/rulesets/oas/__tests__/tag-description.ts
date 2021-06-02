import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('tag-description', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['tag-description']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag', description: 'some-description' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tag has no description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag' }],
    });
    expect([...results]).toEqual([
      {
        code: 'tag-description',
        message: 'Tag object should have a `description`.',
        path: ['tags', '0'],
        range: {
          end: {
            character: 19,
            line: 5,
          },
          start: {
            character: 4,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
