# Tips & Tricks

## Rulesets

### Overriding messages

```js
import { oas } from "https://cdn.skypack.dev/@stoplight/spectral-rulesets";

const customMessages = {
  "oas3-valid-media-example": "OAS3: Examples must be valid against their defined schema.",
  "oas2-oneOf": 'OAS2: "oneOf" keyword must not be used in OpenAPI v2 document.',
  "operation-description": "Must have description.",
};

const oasRulesetWithOverriddenFormats = {
  ...oas,
  rules: Object.entries(oas.rules).reduce((rules, [name, rule]) => {
    rules[name] =
      name in customMessages
        ? {
            ...rule,
            message: customMessages[name],
          }
        : rule;

    return rules;
  }, {}),
};

export default {
  extends: [oasRulesetWithOverriddenFormats],
};
```

### Overriding formats

```js
import { oas } from "https://cdn.skypack.dev/@stoplight/spectral-rulesets";

const myFormat = document => typeof document === "object" && document !== null && "x-lint" in document;

const oasRulesetWithOverriddenFormats = {
  ...oas,
  formats: [myFormat],
  rules: Object.entries(oas.rules).reduce((rules, [name, rule]) => {
    rules[name] =
      "formats" in rule
        ? {
            ...rule,
            formats: [myFormat],
          }
        : rule;

    return rules;
  }, {}),
};

export default {
  extends: [oasRulesetWithOverriddenFormats],
};
```

## $ref resolving

### Symlinked files

```js
// my-resolver.js
"use strict";
const fs = require("fs");
const path = require("@stoplight/path");
const { Resolver } = require("@stoplight/spectral-ref-resolver");

module.exports = new Resolver({
  resolvers: {
    file: {
      async resolve(uri) {
        let ref = uri.href();
        try {
          ref = path.join(path.dirname(ref), await fs.promises.readlink(ref, "utf8"));
        } catch (e) {
          if (e.code === "EINVAL") {
            // not a symlink
          } else {
            throw e;
          }
        }

        return fs.promises.readFile(ref, "utf8");
      },
    },
  },
});
```

then, if you're a CLI user you can refer to that resolver in the following manner:

```bash
spectral lint --resolver my-resolver.js my-document
```

For JS API consumers, this would look like this:

```js
"use strict";
const { Spectral } = require("@stoplight/spectral-core");
const MyResolver = require("./my-resolver.js");

const spectral = new Spectral({
  resolver: MyResolver,
});
```
