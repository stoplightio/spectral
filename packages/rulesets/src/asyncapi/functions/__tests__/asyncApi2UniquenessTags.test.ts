import asyncApi2UniquenessTags from '../asyncApi2UniquenessTags';

function runValidation(targetVal: Array<{ name: string }>) {
  return asyncApi2UniquenessTags(targetVal, null, { path: ['tags'], documentInventory: {} } as any);
}

describe('asyncApi2UniquenessTags', () => {
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
        message: 'Tags contains duplicate tag names: one.',
        path: ['tags'],
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
    ];

    const results = runValidation(tags);
    expect(results).toEqual([
      {
        message: 'Tags contains duplicate tag names: one, two.',
        path: ['tags'],
      },
    ]);
  });
});
