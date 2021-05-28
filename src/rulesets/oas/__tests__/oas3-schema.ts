import { Spectral } from '../../../spectral';

import { createWithRules } from './__helpers__/createWithRules';

const invalidStatusCodes = require('./__fixtures__/invalid-status-codes.oas3.json');

describe('oas3-schema', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas3-schema']);
  });

  test('should preserve sibling additionalProperties errors', async () => {
    const result = await s.run(invalidStatusCodes);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property `42` is not expected to be here.',
        path: ['paths', '/pets', 'post', 'responses', '42'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property `9999` is not expected to be here.',
        path: ['paths', '/pets', 'post', 'responses', '9999'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property `5xx` is not expected to be here.',
        path: ['paths', '/pets', 'post', 'responses', '5xx'],
      }),
    ]);
  });
});
