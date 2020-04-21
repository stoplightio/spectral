import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';

const ruleName = 'asyncapi-server-no-empty-variable';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    servers: {
      production: {
        url: '{sub}.stoplight.io',
        protocol: 'https',
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if {server}.url property contains empty variable substitution pattern', async () => {
    const clone = cloneDeep(doc);

    clone.servers.production.url = '{}.stoplight.io';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Server URL should not have empty variable substitution pattern.',
        path: ['servers', 'production', 'url'],
        severity: rule.severity,
      }),
    ]);
  });
});
