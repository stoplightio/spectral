# Spectral in JavaScript

The Spectral CLI is a thin wrapper around a JavaScript (TypeScript) API, which can be used independently to do all the same things outside of the CLI.

Assuming it has been installed as a Node module via NPM/Yarn, it can be used to lint YAML and JSON documents from a string, or from an object.

First of all, in order to consume the JS API you need to install the appropriate package(s).

```bash
npm install -g @stoplight/spectral-core
```

If you are a Yarn user:

```bash
yarn global add @stoplight/spectral-core
```

## Linting a YAML String

```js
const { Spectral, Document } = require("@stoplight/spectral-core");
const Parsers = require("@stoplight/spectral-parsers"); // make sure to install the package if you intend to use default parsers!
const { truthy } = require("@stoplight/spectral-functions"); // this has to be installed as well

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
  // a ruleset has to be provided
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
spectral.run(myDocument).then(console.log);
```

This will run Spectral with no formats, rules or functions, so it's not going to do anything besides \$ref resolving.
Find out how to add formats, rules and functions below.

## Loading Rulesets

Spectral comes with some rulesets that are very specific to OpenAPI v2/v3, and they can be set using `Spectral.setRuleset()`.

```js
const { Spectral } = require("@stoplight/spectral-core");
const ruleset = require("./my-ruleset"); // this works only for JS ruleset, look at the section below to learn how to load a YAML/JSON ruleset

const spectral = new Spectral();
spectral.setRuleset(ruleset);
// lint
```

### Loading YAML/JSON rulesets

#### Node.js

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

#### Browser

```js
const { Spectral } = require("@stoplight/spectral-core");
const { bundleAndLoadRuleset } = require("@stoplight/spectral-ruleset-bundler/with-loader");
// const { commonjs } = require("@stoplight/spectral-ruleset-bundler/plugins/commonjs"); needed if you want to use CommonJS

const myRuleset = `extends: spectral:oas
rules: {}`;

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

Spectral lets you provide any custom \$ref resolver. By default, http(s) and file protocols are resolved, relatively to
the document Spectral lints against. If you'd like support any additional protocol or adjust the resolution, you are
absolutely fine to do it. In order to achieve that, you need to create a custom json-ref-resolver instance.

You can find more information about how to create custom resolvers in
the [@stoplight/json-ref-resolver](https://github.com/stoplightio/json-ref-resolver) repository.

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

More on that can be found in the [json-ref-resolver repo](https://github.com/stoplightio/json-ref-resolver).
