import * as path from '@stoplight/path';
import { parseWithPointers } from '@stoplight/yaml';
import * as fs from 'fs';

const implicitStringOAS3Document = path.join(__dirname, './__fixtures__/implicit-strings.oas3.yaml');

describe('Parsing', () => {
  it('parses YAML scalar values according to YAML 1.2', () => {
    const { data } = parseWithPointers(fs.readFileSync(implicitStringOAS3Document, 'utf8'));

    expect(data).toHaveProperty(
      'components.schemas.RandomRequest.properties.implicit_string_date.example',
      '2012-10-12',
    );
    expect(data).toHaveProperty(
      'components.schemas.RandomRequest.properties.another_implicit_string_date.example',
      'x20121012',
    );
    expect(data).toHaveProperty(
      'components.schemas.RandomRequest.properties.explicit_string_date.example',
      '2012-10-12',
    );
  });
});
