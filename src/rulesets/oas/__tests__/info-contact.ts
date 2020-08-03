import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('info-contact', () => {
  const s = new Spectral();
  s.setRules({
    'info-contact': Object.assign(ruleset.rules['info-contact'], {
      recommended: true,
      type: RuleType[ruleset.rules['info-contact'].type],
    }),
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
    expect(results).toEqual([
      {
        code: 'info-contact',
        message: 'Info object should contain `contact` object.',
        path: ['info'],
        resolvedPath: ['info', 'contact'],
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
