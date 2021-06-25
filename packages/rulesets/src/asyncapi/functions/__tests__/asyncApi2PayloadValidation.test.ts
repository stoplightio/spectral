import asyncApi2PayloadValidation from '../asyncApi2PayloadValidation';

function runPayloadValidation(targetVal: any) {
  return asyncApi2PayloadValidation(targetVal, null, { path: ['components', 'messages', 'aMessage'] } as any);
}

describe('asyncApi2PayloadValidation', () => {
  test('Properly identify payload that do not fit the AsyncApi2 schema object definition', () => {
    const payload = {
      type: 'object',
      deprecated: 14,
    };

    const results = runPayloadValidation(payload);

    expect(results).toEqual([
      {
        message: '`deprecated` property type must be boolean',
        path: ['components', 'messages', 'aMessage', 'deprecated'],
      },
    ]);
  });
});
