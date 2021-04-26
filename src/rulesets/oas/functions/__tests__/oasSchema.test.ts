describe('oasSchema', () => {
  test('given OAS2, supports x-nullable', () => {
    const testSchema = {
      type: 'string',
      'x-nullable': true,
    };

    expect(runSchema('cxz', testSchema, 2)).toEqual([]);
    expect(runSchema(null, testSchema, 2)).toEqual([]);
    expect(runSchema(2, testSchema, 2)).toEqual([
      {
        message: 'Value type should be string,null',
        path: [],
      },
    ]);
  });

  test('given OAS3, supports nullable', () => {
    const testSchema = {
      type: 'string',
      nullable: true,
    };

    expect(runSchema('cxz', testSchema, 3)).toEqual([]);
    expect(runSchema(null, testSchema, 3)).toEqual([]);
    expect(runSchema(2, testSchema, 3)).toEqual([
      {
        message: 'Value type should be string,null',
        path: [],
      },
    ]);
  });
});
