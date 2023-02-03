# Spectral in JavaScript

The Spectral CLI is a thin wrapper around a JavaScript (TypeScript) API, which can be used independently to do all the same things outside of the CLI, such as linting YAML and JSON documents from a string or an object.

## Prerequisites

To use the Spectral JS API, you need to install the appropriate package.

For npm users:

```bash
npm install -g @stoplight/spectral-core
```

For Yarn users:

```bash
yarn global add @stoplight/spectral-core
```

## Get Started

Similar to using Spectral in the CLI, there are two things you'll need to run Spectral in JS:

- A string or a file containing your structured data (OpenAPI, AsyncAPI, Kubernetes, etc).
- An object or a file representing a ruleset

As an example, here's a script of Spectral in action:

```js title="example-1.mjs" lineNumbers
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

## Load Rulesets and API Specification Files

Let's look at some other examples and how to work with external files.

### Load a JSON/YAML Ruleset

If you would like to run this example, make sure that you have:

- An OpenAPI description document in the same directory as your script named `openapi.yaml`. You can use [this OpenAPI description for the Plaid API](https://github.com/stoplightio/Public-APIs/blob/master/reference/plaid/openapi.yaml).
- A ruleset file named `.spectral.yaml`. It can have the following contents:

```yaml
extends:
  - spectral:oas
```

Here's a script that shows how to load an external API specification file, and an external YAML ruleset:

```js title="example-2.mjs" lineNumbers
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { join } from "path";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import spectralRuntime from "@stoplight/spectral-runtime";
const { fetch } = spectralRuntime;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const myDocument = new Document(
  // load an API specification file from your project's root directory. You can use the openapi.yaml example from here: https://github.com/stoplightio/Public-APIs/blob/master/reference/plaid/openapi.yaml
  fs.readFileSync(join(__dirname, "openapi.yaml"), "utf-8").trim(),
  Parsers.Yaml,
  "openapi.yaml",
);

const spectral = new Spectral();
// load a ruleset file from your project's root directory.
const rulesetFilepath = path.join(__dirname, ".spectral.yaml");
spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));

spectral.run(myDocument).then(console.log);
```

### Load a JavaScript Ruleset

Starting in Spectral v6.0, support was added for [rulesets to be written using JavaScript](./4-custom-rulesets.md#alternative-js-ruleset-format).

To load a JavaScript ruleset, you have to import it similar to how you would import a module:

```js lineNumbers
import { Spectral } from "@stoplight/spectral-core";
import ruleset from "./my-javascript-ruleset";

const spectral = new Spectral();
spectral.setRuleset(ruleset);
```

### Browser

Here's an example script of how you could run Spectral in the browser:

```js title="example-3.mjs" lineNumbers
import { Spectral } from "@stoplight/spectral-core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";

// create a ruleset that extends the spectral:oas ruleset
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
```

### Load Multiple Rulesets

If you'd like to use the `bundleAndLoadRuleset` method to load multiple rulesets, you'll have to create a new Spectral ruleset file, and use the [`extends`](../getting-started/3-rulesets.md#extending-rulesets) functionality to extend the rulesets you'd like to use.

## Advanced

### How to Use a Proxy

Spectral supports HTTP(S) proxies when fetching remote assets:

```js title="example-4.mjs" lineNumbers
import { Spectral } from "@stoplight/spectral-core";
import ProxyAgent from "proxy-agent";
import { createHttpAndFileResolver } from "@stoplight/spectral-ref-resolver";

// start Spectral using a proxy
const spectral = new Spectral({
  resolver: createHttpAndFileResolver({ agent: new ProxyAgent(process.env.PROXY) }),
});

// ... load document

// ... lint document - $refs and rules will be requested using the proxy
```

### How to Use a Custom Resolver

Spectral lets you provide any custom \$ref resolver. By default, HTTP(S) and file protocols are resolved, relatively to
the document Spectral lints against. You can also add support for additional protocols, or adjust the resolution. To achieve that, you need to create a custom json-ref-resolver instance.

For example:

```js title="example-5.cjs" lineNumbers
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

// ... load document

// ... lint document - $refs and rules will be requested using the proxy
```

This custom resolver resolves all remote file refs relative to the current working directory.

You can find more information about how to create custom resolvers in
the [@stoplight/json-ref-resolver](https://github.com/stoplightio/json-ref-resolver) repository.
