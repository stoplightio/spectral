import { message } from '../../message';

describe('message util', () => {
  test('interpolates correctly', () => {
    const template = 'oops... "{{property}}" is missing;error: {{error}}';
    expect(
      message(template, {
        property: 'description',
        error: 'expected property to be truthy',
      }),
    ).toEqual('oops... "description" is missing;error: expected property to be truthy');
  });

  test('handles siblings', () => {
    const template = '{{error}}{{error}}{{property}}{{bar}}{{error}}{{error}}';
    expect(
      message(template, {
        property: 'baz',
        error: 'foo',
      }),
    ).toEqual('foofoobazfoofoo');
  });

  test('strips missing keys', () => {
    const template = '{{foo}}missing {{bar}}:(';
    expect(
      message(template, {
        property: 'description',
        error: 'expected property to be truthy',
      }),
    ).toEqual('missing :(');
  });
});
