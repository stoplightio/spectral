import { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-channel-no-query-nor-fragment';

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

  test('return result if channels.{channel} contains a query delimiter', async () => {
    doc.channels['users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}'] = {};

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Channel path should not include a query (`?`) or a fragment (`#`) delimiter.',
        path: ['channels', 'users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });

  test('return result if channels.{channel} contains a fragment delimiter', async () => {
    doc.channels['users/{userId}/signedOut#onPurpose'] = {};

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Channel path should not include a query (`?`) or a fragment (`#`) delimiter.',
        path: ['channels', 'users/{userId}/signedOut#onPurpose'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
