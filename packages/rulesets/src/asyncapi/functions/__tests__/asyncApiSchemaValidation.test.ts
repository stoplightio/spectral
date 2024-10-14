import asyncApiSchemaValidation from '../asyncApiSchemaValidation';

function runPayloadValidation(targetVal: any, opts: { type: 'examples' | 'default' }) {
  return asyncApiSchemaValidation(targetVal, opts, { path: [], documentInventory: {} } as any);
}

describe('asyncApiSchemaValidation', () => {
  test('validates examples', () => {
    const payload = {
      type: 'object',
      examples: [17, {}, 13, 'string-is-always-accepted'],
    };

    const results = runPayloadValidation(payload, { type: 'examples' });

    expect(results).toEqual([
      {
        message: '"0" property type must be object',
        path: ['examples', 0],
      },
      {
        message: '"2" property type must be object',
        path: ['examples', 2],
      },
    ]);
  });

  test('validates default', () => {
    const payload = {
      type: 'string',
      default: 18,
    };

    const results = runPayloadValidation(payload, { type: 'default' });

    expect(results).toEqual([
      {
        message: '"default" property type must be string',
        path: ['default'],
      },
    ]);
  });
});
