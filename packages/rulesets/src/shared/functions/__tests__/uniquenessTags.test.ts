import uniquenessTags from '../uniquenessTags';

function runValidation(targetVal: Array<{ name: string }>) {
  return uniquenessTags(targetVal, null, { path: ['tags'], documentInventory: {} } as any);
}

describe('uniquenessTags', () => {
  test('should skip empty tags', () => {
    const results = runValidation([]);
    expect(results).toEqual([]);
  });

  test('should skip valid tags', () => {
    const tags = [
      {
        name: 'one',
      },
      {
        name: 'two',
      },
      {
        name: 'three',
      },
    ];

    const results = runValidation(tags);
    expect(results).toEqual([]);
  });

  test('should check 1 duplicate tags', () => {
    const tags = [
      {
        name: 'one',
      },
      {
        name: 'two',
      },
      {
        name: 'one',
      },
    ];

    const results = runValidation(tags);
    expect(results).toEqual([
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['tags', 2, 'name'],
      },
    ]);
  });

  test('should check 2 duplicate tags', () => {
    const tags = [
      {
        name: 'one',
      },
      {
        name: 'two',
      },
      {
        name: 'three',
      },
      {
        name: 'one',
      },
      {
        name: 'two',
      },
      {
        name: 'two',
      },
    ];

    const results = runValidation(tags);
    expect(results).toEqual([
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['tags', 3, 'name'],
      },
      {
        message: '"tags" object contains duplicate tag name "two".',
        path: ['tags', 4, 'name'],
      },
      {
        message: '"tags" object contains duplicate tag name "two".',
        path: ['tags', 5, 'name'],
      },
    ]);
  });
});
