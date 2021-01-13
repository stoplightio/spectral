import type { Spectral } from '../../../spectral';
import { DiagnosticSeverity } from '@stoplight/types';
import { createWithRules } from './__helpers__/createWithRules';

const ruleName = 'asyncapi-channel-no-trailing-slash';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {},
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if channels.{channel} ends with a trailing slash', async () => {
    doc.channels['users/{userId}/signedOut/'] = {};

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Channel path should not end with a slash.',
        path: ['channels', 'users/{userId}/signedOut/'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
