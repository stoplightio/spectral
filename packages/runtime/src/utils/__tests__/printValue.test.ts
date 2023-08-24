import { printValue } from '../printValue';

describe('printValue util', () => {
  it.each<[unknown, string]>([
    [2, '2'],
    [0, '0'],
    ['foo', '"foo"'],
    [false, 'false'],
    [true, 'true'],
    [null, 'null'],
    [undefined, 'undefined'],
  ])('serializes primitive %s value', (input, output) => {
    expect(printValue(input)).toEqual(output);
  });

  it.each([{}, { foo: {} }, new Object(), Object.create(null)])('serializes %s plain object', input => {
    expect(printValue(input)).toEqual('Object{}');
  });

  it.each<unknown[]>([[], [2], ['d']])('serializes %s array', (...input) => {
    expect(printValue([...input])).toEqual('Array[]');
  });

  it.each<[unknown, string]>([
    [new Number(), 'Number'],
    [new (class Foo {})(), 'Foo'],
  ])('serializes %s object', (input, output) => {
    expect(printValue(input)).toEqual(output);
  });
});
