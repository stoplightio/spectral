# Spectral in JavaScript

The Spectral CLI is a thin wrapper around a JavaScript (TypeScript) API, which can be used independently to do all the same things outside of the CLI.

Assuming it has been installed as a Node module via NPM/Yarn, it can be used to lint YAML and JSON documents from a string, or from an object.

## Linting a YAML String

```js
const { Spectral, Document, Parsers } = require('@stoplight/spectral');

const myOpenApiDocument = new Document(`responses:
  '200':
    description: ''
    schema:
      $ref: '#/definitions/error-response'
`, Parsers.Yaml);

const spectral = new Spectral();
spectral
  .run(myOpenApiDocument)
  .then(console.log);
```

This will run Spectral with no formats, rules or functions, so it's not going to do anything besides $ref resolving.
Find out how to add formats, rules and functions below.

## Linting an Object

Instead of passing a string to `Document`, you can pass in JavaScript object, with or without `$ref`'s.

```js
const { Spectral } = require('@stoplight/spectral');

const myOpenApiDocument = {
  responses: {
    '200': {
      description: '',
      schema: {
        $ref: '#/definitions/error-response',
      },
    },
  },
};

const spectral = new Spectral();
spectral.run(myOpenApiDocument).then(console.log);
```

Note - this usage is discouraged, since you won't get accurate ranges.

## Registering Formats

If you are interested in linting OpenAPI documents or JSON Schema models, you may need to register formats.
Assuming your rulesets use the built-in Spectral formats, this can be accomplished as follows

- OpenAPI

```js
const { Spectral, isOpenApiv2, isOpenApiv3 } = require('@stoplight/spectral');

const spectral = new Spectral();
spectral.registerFormat('oas2', isOpenApiv2);
spectral.registerFormat('oas3', isOpenApiv3);
```

- JSON Schema

```js
const {
  Spectral,
  isJSONSchema,
  isJSONSchemaDraft4,
  isJSONSchemaDraft6,
  isJSONSchemaDraft7,
  isJSONSchemaDraft2019_09,
  isJSONSchemaLoose,
} = require('@stoplight/spectral');

const spectral = new Spectral();
spectral.registerFormat('json-schema', isJSONSchema);
spectral.registerFormat('json-schema-loose', isJSONSchemaLoose);
spectral.registerFormat('json-schema-draft4', isJSONSchemaDraft4);
spectral.registerFormat('json-schema-draft6', isJSONSchemaDraft6);
spectral.registerFormat('json-schema-draft7', isJSONSchemaDraft7);
spectral.registerFormat('json-schema-2019-09', isJSONSchemaDraft2019_09);
```

Learn more about predefined formats in the [ruleset documentation](../getting-started/3-rulesets.md#formats).

## Loading Rules

Spectral comes with some rulesets that are very specific to OpenAPI v2/v3, and they can be loaded using `Spectral.loadRuleset()`.

```js
const { Spectral, isOpenApiv2, isOpenApiv3 } = require('@stoplight/spectral');

const myOpenApiDocument = `
openapi: 3.0.0
# here goes the rest of document
`

const spectral = new Spectral();
spectral.registerFormat('oas2', isOpenApiv2);
spectral.registerFormat('oas3', isOpenApiv3);
spectral.loadRuleset('spectral:oas')
  .then(() => spectral.run(myOpenApiDocument))
  .then(results => {
    console.log('here are the results', results);
  });
```

The OpenAPI rules are opinionated. There might be some rules that you prefer to change, or disable. We encourage you to create your rules to fit your use case, and we welcome additions to the existing rulesets as well!

Custom rulesets can also be loaded using `spectral.loadRuleset()` by specifying the exact path to the ruleset file.

```js
const { Spectral, isOpenApiv2, isOpenApiv3 } = require('@stoplight/spectral');
const { join } = require('path');

const myOpenApiDocument = `
openapi: 3.0.0
# here goes the rest of document
`

const spectral = new Spectral();
spectral.registerFormat('oas2', isOpenApiv2);
spectral.registerFormat('oas3', isOpenApiv3);

spectral.loadRuleset(join(__dirname './path/to/my-ruleset.yaml'));
  .then(() => spectral.run(myOpenApiDocument))
  .then(results => {
    console.log('here are the results', results);
  });
```

Alternatively, if your ruleset is stored in a plain JSON file that doesn't extend any other rulesets, you can also consider using `setRuleset`, as follows

```js
const { Spectral } = require('@stoplight/spectral');
const ruleset = require('./my-ruleset.json');

const spectral = new Spectral();
spectral.setRuleset(ruleset);
spectral.run(myOpenApiDocument)
  .then(results => {
    console.log('here are the results', results);
  });
```

## Advanced

### Creating a Custom Format

Spectral supports two core formats: `oas2` and `oas3`. Using `registerFormat` you can add support for auto-detecting other formats. You might want to do this for a ruleset which is run against multiple major versions of description format like RAML v0.8 and v1.0.

```js
const { Spectral } = require('@stoplight/spectral');

const spectral = new Spectral();

spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);

spectral.setRuleset({
  functions: {},
  rules: {
    rule1: {
      given: '$.x',
      formats: ['foo-bar'],
      severity: 'error',
      then: {
        function: 'truthy',
      },
    },
  },
});

spectral
  .run({
    'foo-bar': true,
    x: false
  })
  .then(result => {
    expect(result).toEqual([
      expect.objectContaining({
       code: 'rule1',
     }),
   ]);
  });
```

Alternatively you may lookup for certain format by optional `source`, which could be passed in `run` options.

```js
const { Document, Spectral } = require('@stoplight/spectral');

const spectral = new Spectral();

spectral.registerFormat('foo-bar', (_, source) => source === '/foo/bar');

spectral.setRuleset({
  functions: {},
  rules: {
    rule1: {
      given: '$.x',
      formats: ['foo-bar'],
      severity: 'error',
      then: {
        function: 'truthy',
      },
    },
  },
});

spectral
  .run(new Document(`foo-bar: true\nx: false`, Parsers.Yaml, '/foo/bar'))
  .then(result => {
    expect(result).toEqual([
      expect.objectContaining({
       code: 'rule1',
     }),
   ]);
  });
```

### Using a Proxy

Spectral supports HTTP(S) proxies when fetching remote schemas and rulesets.

```js
const { Spectral } = require('@stoplight/spectral');

const spectral = new Spectral({ proxyUri: 'http://my-proxy:3000' });
spectral.loadRuleset('https://example.org/my-rules')

// lint as usual - $refs and rules will be requested using the proxy
```

### Using a Custom Resolver

Spectral lets you provide any custom $ref resolver. By default, http(s) and file protocols are resolved, relatively to
the document Spectral lints against. If you'd like support any additional protocol or adjust the resolution, you are
absolutely fine to do it. In order to achieve that, you need to create a custom json-ref-resolver instance.

You can find more information about how to create custom resolvers in
the [@stoplight/json-ref-resolver](https://github.com/stoplightio/json-ref-resolver) repository.

```js
const path = require('path');
const fs = require('fs');
const { Spectral } = require('@stoplight/spectral');
const { Resolver } = require('@stoplight/json-ref-resolver');

const customFileResolver = new Resolver({
  resolvers: {
    file: {
      resolve: ref => {
        return new Promise((resolve, reject) => {
          const basePath = process.cwd();
          const refPath = ref.path();
          fs.readFile(path.join(basePath, refPath), 'utf8', (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      }
    }
  }
});

const spectral = new Spectral({ resolver: customFileResolver });

// lint document as usual
```

The custom resolver we've just created will resolve all remote file refs relatively to the current working directory.

More on that can be found in the [json-ref-resolver repo](https://github.com/stoplightio/json-ref-resolver).

### Using a Custom De-duplication Strategy

By default, Spectral will de-duplicate results based on the result code and document location. You can customize this
behavior with the `computeFingerprint` option. For example, here is the default fingerprint implementation:

The final reported results are de-duplicated based on their computed fingerprint.

```ts
const spectral = new Spectral({
  computeFingerprint: (rule: IRuleResult, hash) => {
    let id = String(rule.code);

    if (rule.path && rule.path.length) {
      id += JSON.stringify(rule.path);
    } else if (rule.range) {
      id += JSON.stringify(rule.range);
    }

    if (rule.source) id += rule.source;

    return hash(id);
  },
});
```
