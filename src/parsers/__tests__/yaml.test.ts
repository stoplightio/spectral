import { Yaml } from '../yaml';

describe('YAML Parser', () => {
  it('parses scalar values according to YAML 1.2', () => {
    const { data } = Yaml.parse(`%YAML 1.2
---
 # implicit_string_date:
- 2012-10-12
# another_implicit_string_date:
- x20121012
# explicit_string_date:
- "2012-10-12"`);

    expect(data).toEqual(['2012-10-12', 'x20121012', '2012-10-12']);
  });
});
