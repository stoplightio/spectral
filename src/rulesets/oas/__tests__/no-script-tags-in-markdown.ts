import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('no-script-tags-in-markdown', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['no-script-tags-in-markdown']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        description: 'some description text',
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if descriptions include <script', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        description: 'some description contains <script',
      },
    });
    expect([...results]).toEqual([
      {
        code: 'no-script-tags-in-markdown',
        message: 'Markdown descriptions should not contain `<script>` tags.',
        path: ['info', 'description'],
        range: {
          end: {
            character: 54,
            line: 4,
          },
          start: {
            character: 19,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
