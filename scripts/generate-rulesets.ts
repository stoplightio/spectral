import { writeFileSync } from 'fs';
import { resolve } from 'path';
import * as YAML from 'yaml';
import { commonOasRules } from '../src/rulesets/oas';
import { oas2Rules } from '../src/rulesets/oas2';
import { oas3Rules } from '../src/rulesets/oas3';

[
  { name: 'oas', rules: commonOasRules() },
  { name: 'oas2', rules: oas2Rules() },
  { name: 'oas3', rules: oas3Rules() },
].forEach(({ name, rules }) => {
  const path = resolve(process.cwd(), 'src', 'rulesets', name, `${name}.ruleset.yaml`);
  console.log(`Generating ruleset file: ${path}`);
  writeFileSync(
    path,
    YAML.stringify({
      rules,
    }),
    { encoding: 'utf8' }
  );
});
