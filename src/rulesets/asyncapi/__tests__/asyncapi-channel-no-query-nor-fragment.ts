import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-channel-no-query-nor-fragment';
let s: Spectral;
let rule: Rule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    channels: {
      'users/{userId}/signedUp': {},
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if channels.{channel} contains a query delimiter', async () => {
    const clone = cloneDeep(doc);

    clone.channels['users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}'] = {};

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Channel path should not include a query (`?`) or a fragment (`#`) delimiter.',
        path: ['channels', 'users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if channels.{channel} contains a fragment delimiter', async () => {
    const clone = cloneDeep(doc);

    clone.channels['users/{userId}/signedOut#onPurpose'] = {};

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Channel path should not include a query (`?`) or a fragment (`#`) delimiter.',
        path: ['channels', 'users/{userId}/signedOut#onPurpose'],
        severity: rule.severity,
      }),
    ]);
  });
});
