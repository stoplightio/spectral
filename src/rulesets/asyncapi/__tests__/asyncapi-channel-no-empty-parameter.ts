import { cloneDeep } from 'lodash';

import { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-channel-no-empty-parameter';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);
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

  test('return result if channels.{channel} contains empty parameter substitution pattern', async () => {
    const clone = cloneDeep(doc);

    clone.channels['users/{}/signedOut'] = {};

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Channel path should not have empty parameter substitution pattern.',
        path: ['channels', 'users/{}/signedOut'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
