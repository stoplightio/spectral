import { schema } from '../schema';

function runSchema(target: any, schemaObj: object) {
  return schema(target, { schema: schemaObj }, { given: ['$'] }, { given: null, original: null });
}

describe('schema', () => {
  const testSchema = {
    type: 'array',
    items: {
      type: 'string',
    },
    maxItems: 1,
  };

  test('will error with totally invalid input', () => {
    const input = { foo: 'bar' };
    expect(runSchema(input, testSchema)).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "should be array",
    "path": Array [
      "$",
    ],
  },
]
`);
  });

  test('will error with subtly invalid input', () => {
    const input = ['1', '2'];
    expect(runSchema(input, testSchema)).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "should NOT have more than 1 items",
    "path": Array [
      "$",
    ],
  },
]
`);
  });
});
