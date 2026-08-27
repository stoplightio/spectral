import { aas2_0, aas3, aas3_1 } from '@stoplight/spectral-formats';
import asyncApiPayloadValidation from '../asyncApiPayloadValidation';

function runPayloadValidation(targetVal: any, format = aas2_0) {
  return asyncApiPayloadValidation(targetVal, null, {
    path: ['components', 'messages', 'aMessage'],
    document: { formats: new Set([format]) },
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

  test('validates payloads against the AsyncAPI 3.1 schema object definition', () => {
    const results = runPayloadValidation(
      {
        type: 'object',
        deprecated: 14,
      },
      aas3_1,
    );

    expect(results).toEqual([
      {
        message: '"deprecated" property type must be boolean',
        path: ['components', 'messages', 'aMessage', 'deprecated'],
      },
    ]);
  });

  test('uses the latest known AsyncAPI 3.x schema object definition as fallback', () => {
    const results = runPayloadValidation(
      {
        type: 'object',
        deprecated: 14,
      },
      aas3,
    );

    expect(results).toEqual([
      {
        message: '"deprecated" property type must be boolean',
        path: ['components', 'messages', 'aMessage', 'deprecated'],
      },
    ]);
  });
});
