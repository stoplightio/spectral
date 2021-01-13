import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('no-eval-in-markdown', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['no-eval-in-markdown']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        title: 'some title text',
        description: 'some description text',
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if titles include eval', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        title: 'some title contains eval(',
        description: 'some description text',
      },
    });
    expect(results).toEqual([
      {
        code: 'no-eval-in-markdown',
        message: 'Markdown descriptions should not contain `eval(`.',
        path: ['info', 'title'],
        range: {
          end: {
            character: 40,
            line: 4,
          },
          start: {
            character: 13,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return errors if descriptions include eval', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        title: 'some title text',
        description: 'some description contains eval(',
      },
    });
    expect(results).toEqual([
      {
        code: 'no-eval-in-markdown',
        message: 'Markdown descriptions should not contain `eval(`.',
        path: ['info', 'description'],
        range: {
          end: {
            character: 52,
            line: 5,
          },
          start: {
            character: 19,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
