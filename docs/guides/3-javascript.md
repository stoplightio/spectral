# Spectral in JavaScript

The Spectral CLI is a thin wrapper around a JavaScript (TypeScript) API, which can be used independently to do all the same things outside of the CLI, such as linting YAML and JSON documents from a string or an object.

## Prerequisites

In order to consume the Spectral JS API you need to install the appropriate package.

For NPM users:

```bash
npm install -g @stoplight/spectral-core
```

For Yarn users:

```bash
yarn global add @stoplight/spectral-core
```

## Getting Started

Similar to using Spectral in the CLI, there are two things you'll need to run Spectral in JS:

- A string or a file representing an API specification
- An object or a file representing a ruleset

As an example, here's a script of Spectral in action:

```js
// example-1.mjs
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import { truthy } from "@stoplight/spectral-functions"; // this has to be installed as well

// this will be our API specification document
const myDocument = new Document(
  `---
responses:
  '200':
    description: ''`,
  Parsers.Yaml,
  "/my-file",
);

const spectral = new Spectral();
spectral.setRuleset({
  // this will be our ruleset
  rules: {
    "no-empty-description": {
      given: "$..description",
      message: "Description must not be empty",
      then: {
        function: truthy,
      },
    },
  },
});

// we lint our document using the ruleset we passed to the Spectral object
spectral.run(myDocument).then(console.log);
```

And here's the same example using CommonJS:

```js
```

## Load Rulesets and API Specification Files

Let's look at some other examples and how to work with external files.

### Load a JSON/YAML Ruleset

If you would like to run these examples, make sure that you have:

- An OpenAPI specification file in the same directory as your script named `petstore.yaml`. You can use the one found [here](https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.0/petstore.yaml).
- A ruleset file named `.spectral.yaml`. It can have the following contents:

```yaml
extends:
  - spectral:oas
```

Here's an example that shows how to load an external API specification file, and an external YAML ruleset:

```js
// example-2.mjs
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { join } from 'path';
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import spectralRuntime from "@stoplight/spectral-runtime";
const { fetch } = spectralRuntime;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const myDocument = new Document(
  // load an API specification file from your project's root directory. You can use the petstore.yaml example from here: https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.0/petstore.yaml
  fs.readFileSync(join(__dirname, 'petstore.yaml'), 'utf-8').trim(),
  Parsers.Yaml,
  'petstore.yaml'
);

const spectral = new Spectral();
// load a ruleset file from your project's root directory. 
const rulesetFilepath = path.join(__dirname, ".spectral.yaml");
spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));

spectral.run(myDocument).then(console.log);
```

And here's the same example using CommonJS:

```js
const path = require("path");
const fs = require("fs");

const { Spectral } = require("@stoplight/spectral-core");
const { fetch } = require("@stoplight/spectral-runtime"); // can also use isomorphic-fetch, etc.. If you ruleset does not reference any external assets, you can provide some stub instead.
const { bundleAndLoadRuleset } = require("@stoplight/spectral-ruleset-bundler/with-loader");
// const { commonjs } = require("@stoplight/spectral-ruleset-bundler/plugins/commonjs"); needed if you want to use CommonJS

const rulesetFilepath = path.join(__dirname, ".spectral.yaml");

const spectral = new Spectral();
s.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));
// or, if you use module.exports (CommonJS) s.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }), [commonjs()]);
```

### Load a JavaScript Ruleset

Starting in Spectral v6.0, we added support for rulesets to be written using JavaScript. 

You can find more information about it [here](./4-custom-rulesets.md#alternative-js-ruleset-format).

To load a JavaScript ruleset, you have to import it similar to how you would import a module:

```js
import { Spectral } from "@stoplight/spectral-core";
import ruleset from "./my-javascript-ruleset";

const spectral = new Spectral();
spectral.setRuleset(ruleset);
```

### Browser

Here's an example script of how you could run Spectral in the browser:

```js
const { Spectral } = require("@stoplight/spectral-core");
const { bundleAndLoadRuleset } = require("@stoplight/spectral-ruleset-bundler/with-loader");
// const { commonjs } = require("@stoplight/spectral-ruleset-bundler/plugins/commonjs"); needed if you want to use CommonJS

// create a ruleset that just extends the spectral:oas ruleset
const myRuleset = `extends: spectral:oas
rules: {}`;

// try to load an external ruleset
const fs = {
  promises: {
    async readFile(filepath) {
      if (filepath === "/.spectral.yaml") {
        return myRuleset;
      }

      throw new Error(`Could not read ${filepath}`);
    },
  },
};

const spectral = new Spectral();
s.setRuleset(await bundleAndLoadRuleset("/.spectral.yaml", { fs, fetch }));
// or, if you use module.exports (CommonJS) s.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }), [commonjs()]);
```

## Advanced

### Using a Proxy

Spectral supports HTTP(S) proxies when fetching remote assets.

```js
const { Spectral } = require("@stoplight/spectral-core");
const ProxyAgent = require("proxy-agent");
const { createHttpAndFileResolver } = require("@stoplight/spectral-ref-resolver");

const spectral = new Spectral({
  resolver: createHttpAndFileResolver({ agent: new ProxyAgent(process.env.PROXY) }),
});

// lint as usual - $refs and rules will be requested using the proxy
```

### Using a Custom Resolver

Spectral lets you provide any custom \$ref resolver. By default, HTTP(S) and file protocols are resolved, relatively to
the document Spectral lints against. You can also add support for additional protocols, or adjust the resolution. In order to achieve that, you need to create a custom json-ref-resolver instance.

For example:

```js
const path = require("path");
const fs = require("fs");
const { Spectral } = require("@stoplight/spectral-cli");
const { Resolver } = require("@stoplight/json-ref-resolver");

const customFileResolver = new Resolver({
  resolvers: {
    file: {
      resolve: ref => {
        return new Promise((resolve, reject) => {
          const basePath = process.cwd();
          const refPath = ref.path();
          fs.readFile(path.join(basePath, refPath), "utf8", (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      },
    },
  },
});

const spectral = new Spectral({ resolver: customFileResolver });

// lint document as usual
```

The custom resolver we've just created will resolve all remote file refs relatively to the current working directory.

You can find more information about how to create custom resolvers in
the [@stoplight/json-ref-resolver](https://github.com/stoplightio/json-ref-resolver) repository.