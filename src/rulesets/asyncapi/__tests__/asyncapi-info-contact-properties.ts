import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';

const ruleName = 'asyncapi-info-contact-properties';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
    asyncapi: '2.0.0',
    info: {
      contact: {
        name: 'stoplight',
        url: 'stoplight.io',
        email: 'support@stoplight.io',
      },
    },
  };

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test.each(['name', 'url', 'email'])('return result if contact.%s property is missing', async (property: string) => {
    const clone = cloneDeep(doc);

    delete clone.info.contact[property];

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Contact object should have `name`, `url` and `email`.',
        path: ['info', 'contact'],
        severity: rule.severity,
      }),
    ]);
  });
});
