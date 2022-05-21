# @stoplight/spectral-ruleset-migrator

This project serves as a converter between the legacy ruleset format and a new one.
It's used internally, albeit it can be used externally too, also in browsers.

For the time being there are two output formats supported: commonjs & esm.
The migrator loads the ruleset, apply a number of conversions and return a valid JS code that can be executed later on.

## Examples

```yaml
# .spectral.yaml
extends: spectral:oas
formats: [oas2, json-schema-loose]
rules:
  oas3-schema: warning
  valid-type:
    message: Type must be valid
    given: $..type
    then:
      function: pattern
      functionOptions:
        mustMatch: ^(string|number)$
```

```js
// .spectral.js (CommonJS)
const { oas: oas } = require("@stoplight/spectral-rulesets");
const { oas2: oas2, jsonSchemaLoose: jsonSchemaLoose } = require("@stoplight/spectral-formats");
const { pattern: pattern } = require("@stoplight/spectral-functions");
module.exports = {
  extends: oas,
  formats: [oas2, jsonSchemaLoose],
  rules: {
    "oas3-schema": "warning",
    "valid-type": {
      message: "Type must be valid",
      given: "$..type",
      then: {
        function: pattern,
        functionOptions: {
          mustMatch: "^(string|number)$",
        },
      },
    },
  },
};
```

```js
// .spectral.js (ES Module)
import { oas } from "@stoplight/spectral-rulesets";
import { oas2, jsonSchemaLoose } from "@stoplight/spectral-formats";
import { pattern } from "@stoplight/spectral-functions";
export default {
  extends: oas,
  formats: [oas2, jsonSchemaLoose],
  rules: {
    "oas3-schema": "warning",
    "valid-type": {
      message: "Type must be valid",
      given: "$..type",
      then: {
        function: pattern,
        functionOptions: {
          mustMatch: "^(string|number)$",
        },
      },
    },
  },
};
```

## Usage

### With spectral-ruleset-bundler

If you need to transform the YAML/JSON ruleset and load it in a single step, we've got you covered.
Please refer to [@stoplight/spectral-ruleset-bundler](https://www.npmjs.com/package/@stoplight/spectral-ruleset-bundler).

### Programmatically

```ts
const { migrateRuleset } = require("@stoplight/spectral-ruleset-migrator");
const fs = require("fs");
const path = require("path");

migrateRuleset(path.join(__dirname, "spectral.json"), {
  fs,
  format: "commonjs", // esm available too, but not recommended for now
}).then(fs.promises.writeFile.bind(fs.promises, path.join(__dirname, ".spectral.js")));
```

### Caveats

#### YAML/JSON extending JS rulesets

It's not disallowed for a YAML/JSON ruleset to extend another ruleset expressed in JS,
albeit one has to notice that the formats have to be matched.
In other words if you select "commonjs" as your target format, your extended rulesets have to follow,
otherwise Node.js or any other tool you use in between may refuse to load the resulting code.
If that happens to be the limitation for you, try your luck with [esm](https://www.npmjs.com/package/esm), [Babel](https://babeljs.io/) or a bundler such as [rollup.js](https://rollupjs.org/).
