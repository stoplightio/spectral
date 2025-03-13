import { aas2_0 } from '@stoplight/spectral-formats';
import asyncApiPayloadValidation from '../asyncApiPayloadValidation';

function runPayloadValidation(targetVal: any) {
  return asyncApiPayloadValidation(targetVal, null, {
    path: ['components', 'messages', 'aMessage'],
    document: { formats: new Set([aas2_0]) },
  } as any);
}

describe('asyncApiPayloadValidation', () => {
  test('Properly identify payload that do not fit the AsyncApi2 schema object definition', () => {
    const payload = {
      type: 'object',
      deprecated: 14,
    };

    const results = runPayloadValidation(payload);

    expect(results).toEqual([
      {
        message: '"deprecated" property type must be boolean',
        path: ['components', 'messages', 'aMessage', 'deprecated'],
      },
    ]);
  });
});
