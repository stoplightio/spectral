import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-info-license';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      info: {
        license: {
          name: 'MIT',
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if license property is missing', async () => {
    delete doc.info.license;

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'AsyncAPI object should contain `license` object.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
