import { message } from '../message';

describe('message util', () => {
  test('interpolates correctly', () => {
    const template = 'oops... "{{property}}" is missing;error: {{error}}';
    expect(
      message(template, {
        property: 'description',
        error: 'expected property to be truthy',
        path: '',
        givenPath: '',
        value: void 0,
      }),
    ).toEqual('oops... "description" is missing;error: expected property to be truthy');
  });

  test.each([0, false, null, undefined])('interpolates %s value correctly', value => {
    const template = 'Value must not equal {{value}}';
    expect(
      message(template, {
        property: 'description',
        error: 'expected property to be truthy',
        path: '',
        givenPath: '',
        value,
      }),
    ).toEqual(`Value must not equal ${value}`);
  });

  test('handles siblings', () => {
    const template = '{{error}}{{error}}{{property}}{{bar}}{{error}}{{error}}';
    expect(
      message(template, {
        property: 'baz',
        error: 'foo',
        path: '',
        givenPath: '',
        value: void 0,
      }),
    ).toEqual('foofoobazfoofoo');
  });

  test('strips missing keys', () => {
    const template = '{{foo}}missing {{bar}}:(';
    expect(
      message(template, {
        property: 'description',
        error: 'expected property to be truthy',
        path: '',
        givenPath: '',
        value: void 0,
      }),
    ).toEqual('missing :(');
  });
});
