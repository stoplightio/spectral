import * as fs from 'fs';
import * as path from '@stoplight/path';
import { compile } from 'json-schema-to-typescript';

import schema from '../src/validation/schema';

compile(schema, 'Ruleset', {
  bannerComment: '/*eslint-disable*/',
  style: {
    singleQuote: true,
  },
}).then(ts => {
  return fs.promises.writeFile(path.join(__dirname, '../src/validation/types.ts'), ts);
});
