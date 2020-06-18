import { functions } from '../../../../functions';
import { asyncApi2PayloadValidation } from '../asyncApi2PayloadValidation';

function runPayloadValidation(targetVal: any) {
  return asyncApi2PayloadValidation.call(
    { functions },
    targetVal,
    null,
    { given: ['$', 'components', 'messages', 'aMessage'] },
    { given: null, original: null, documentInventory: {} as any, rule: {} as any },
  );
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
        message: '`deprecated` property type should be boolean',
        path: ['$', 'components', 'messages', 'aMessage', 'deprecated'],
      },
    ]);
  });
});
