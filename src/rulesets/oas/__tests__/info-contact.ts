import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('info-contact', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['info-contact']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { version: '1.0', contact: {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info is missing contact', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { version: '1.0' },
    });
    expect([...results]).toEqual([
      {
        code: 'info-contact',
        message: 'Info object should contain `contact` object.',
        path: ['info'],
        range: {
          end: {
            character: 20,
            line: 4,
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
