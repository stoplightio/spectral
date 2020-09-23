import { Dictionary } from '@stoplight/types';
import { Replacer } from '../replacer';

describe('Replacer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('interpolates correctly', () => {
    const replacer = new Replacer<Dictionary<unknown>>(2);
    const template = 'oops... "{{property}}" is missing;error: {{error}}';
    expect(
      replacer.print(template, {
        property: 'description',
        error: 'expected property to be truthy',
      }),
    ).toEqual('oops... "description" is missing;error: expected property to be truthy');
  });

  it.each([0, false, null, undefined])('interpolates %s value correctly', value => {
    const replacer = new Replacer<Dictionary<unknown>>(2);
    const template = 'Value must not equal {{value}}';
    expect(
      replacer.print(template, {
        value,
      }),
    ).toEqual(`Value must not equal ${value}`);
  });

  it('handles siblings', () => {
    const replacer = new Replacer<Dictionary<unknown>>(2);
    const template = '{{error}}{{error}}{{property}}{{bar}}{{error}}{{error}}';
    expect(
      replacer.print(template, {
        property: 'baz',
        error: 'foo',
        path: '',
        value: void 0,
      }),
    ).toEqual('foofoobazfoofoo');
  });

  it('ignores new lines', () => {
    const replacer = new Replacer<Dictionary<unknown>>(2);
    const template = '{{\ntest}}';
    expect(replacer.print(template, {})).toEqual(template);
  });

  it('strips missing keys', () => {
    const replacer = new Replacer<Dictionary<unknown>>(2);
    const template = '{{foo}}missing {{bar}}:(';
    expect(
      replacer.print(template, {
        property: 'description',
        error: 'expected property to be truthy',
      }),
    ).toEqual('missing :(');
  });

  it('evaluates expressions', () => {
    const replacer = new Replacer<Dictionary<unknown>>(2);

    const template = "#{{path[1] + '-' + path[2].toUpperCase()}}";

    expect(
      replacer.print(template, {
        path: ['foo', 'bar', '/a'],
      }),
    ).toEqual('bar-/A');
  });

  it('supports custom functions', () => {
    const replacer = new Replacer<Dictionary<unknown>>(2);
    replacer.addFunction('printPath', function () {
      const { path } = this;
      return Array.isArray(path) ? path.join('.') : String(path);
    });

    const template = '#{{printPath()}}';

    expect(
      replacer.print(template, {
        path: ['foo', 'bar', '/a'],
      }),
    ).toEqual('foo.bar./a');
  });

  it('handles and prints out exceptions thrown during evaluation', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
      // no-op
    });

    const replacer = new Replacer<Dictionary<unknown>>(2);
    const template = 'value is: #{{value.name}}';

    expect(
      replacer.print(template, {
        value: null,
      }),
    ).toEqual('value is: ');
    expect(warnSpy).toBeCalledWith(new TypeError("Cannot read property 'name' of null"));
  });
});
