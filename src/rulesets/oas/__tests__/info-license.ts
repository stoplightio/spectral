import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('info-license', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['info-license']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
        license: { name: 'MIT' },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info missing license', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
      },
    });
    expect(results).toEqual([
      {
        code: 'info-license',
        message: 'OpenAPI object `info` should contain a `license` object.',
        path: ['info'],
        range: {
          end: {
            character: 28,
            line: 5,
          },
          start: {
            character: 9,
            line: 3,
          },
        },
        severity: 1,
      },
    ]);
  });
});
