import { compile } from '../compile';

describe('compile', () => {
  it('flat', () => {
    expect(compile('$.info.contact')).toEqual({
      singleMatch: true,
      deep: false,
      value: /^info\/contact$/,
    });

    expect(compile('$.info.contact.*')).toEqual({
      deep: false,
      singleMatch: false,
      value: /^info\/contact\/[^/]*$/,
    });

    expect(compile('$.servers[*].url')).toEqual({
      deep: false,
      singleMatch: false,
      value: /^servers\/[0-9]+\/url$/, // todo: can [*] actually match anything?
    });
  });

  it('deep', () => {
    expect(compile('$..*')).toEqual({
      singleMatch: false,
      deep: true,
      value: /./,
    });

    expect(compile('$..content..*')).toEqual({
      deep: true,
      singleMatch: false,
      value: /(?:^|\/)content\/.*$/,
    });

    expect(compile('$..empty')).toEqual({
      deep: true,
      singleMatch: false,
      value: /(?:^|\/)empty$/,
    });

    expect(compile('$.paths..content.*.examples')).toEqual({
      deep: true,
      singleMatch: false,
      value: /^paths\/(?:.*)?content\/[^/]*\/examples$/,
    });
  });

  it('aot subscript', () => {
    expect(compile(`$..[?(@property === '$ref')]`)).toEqual({
      deep: true,
      singleMatch: false,
      value: /(?:^|\/)(?:\$ref)$/,
    });

    expect(compile(`$..[?(@property === 'description' || @property === 'title')]`)).toEqual({
      deep: true,
      singleMatch: false,
      value: /(?:^|\/)(?:description|title)$/,
    });

    expect(compile("$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]")).toEqual({
      deep: false,
      singleMatch: false,
      value: /^paths\/[^/]*\/(?:get|put|post)$/,
    });
  });

  it.each(['$..headers..[?(@.example && @.schema)]', '$.paths.*[?( @property >= 400 )]', '$.paths[0:2]'])(
    '%s is unsupported',
    expr => {
      expect(compile(expr)).toBeNull();
    },
  );
});
