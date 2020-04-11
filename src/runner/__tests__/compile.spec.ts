import { compile } from '../compile';

describe('compile', () => {
  it('single matches', () => {
    expect(compile('$..*')).toEqual({
      singleMatch: false,
      deep: true,
      value: /./,
    });

    expect(compile('$.info.contact')).toEqual({
      singleMatch: true,
      deep: false,
      value: /^info\/contact$/,
    });

    expect(compile('$.info.contact.*')).toEqual(/^info\/contact\/[^/]*$/);
    expect(compile('$.servers[*].url')).toEqual(/^servers\/[0-9]+\/url$/);
  });

  it('deep', () => {
    expect(compile('$..empty')).toEqual(/(?:^|\/)empty$/);

    expect(compile('$.paths..content.*.examples')).toEqual(/^paths\/?.*\/content\/[^/]*\/examples$/);
  });

  it('aot subscript', () => {
    expect(compile(`$..[?(@property === '$ref')]`)).toEqual(/(?:^|\/)(?:\$ref)$/);
    expect(compile(`$..[?(@property === 'description' || @property === 'title')]`)).toEqual(
      /(?:^|\/)(?:description|title)$/,
    );

    expect(compile("$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]")).toEqual(
      /^paths\/[^/]*\/(?:get|put|post)$/,
    );
  });

  it.each(['$..headers..[?(@.example && @.schema)]', '$.paths.*[?( @property >= 400 )]', '$.paths[0:2]'])(
    '%s is unsupported',
    expr => {
      expect(compile(expr)).toBeNull();
    },
  );
});
