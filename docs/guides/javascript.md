# Spectral in JavaScript

The Spectral CLI is a thin wrapper around a JavaScript (TypeScript) API, which can be used independently to do all the same things outside of the CLI.

Assuming it has been installed as a Node module via NPM/Yarn, it can be used to lint YAML and JSON documents from a string, or from an object.

## Linting a YAML string

```js
const { Spectral } = require('@stoplight/spectral');
const { getLocationForJsonPath, parseWithPointers } = require("@stoplight/yaml");

const myOpenApiDocument = parseWithPointers(`responses:
  '200':
    description: ''
    schema:
      $ref: '#/definitions/error-response'
`);

const spectral = new Spectral();
spectral
  .run({
    parsed: myOpenApiDocument,
    getLocationForJsonPath,
  })
  .then(console.log);
```

Please note that by default Spectral supports YAML 1.2 with merge keys extension.

This will run Spectral with no formats, rules or functions, so it's not going to do anything besides $ref resolving.
Find out how to add formats, rules and functions below.

## Linting an Object

Instead of passing a string to `parseWithPointers`, you can pass in JavaScript object, with or without `$ref`'s.

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

Learn more about predefined formats in the (ruleset documentation)[../getting-started/rulesets.md#formats].

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
spectral.registerFormat('oas3', isOpenApiv3);spectral.loadRuleset('spectral:oas3') // spectral:oas2 for OAS 2.0 aka Swagger
  .then(() => spectral.run(myOpenApiDocument))
  .then(results => {
    console.log('here are the results', results);
  });
``` 

The OpenAPI rules are opinionated. There might be some rules that you prefer to change. We encourage you to create your rules to fit your use case. We welcome additions to the existing rulesets as well!

## Advanced

### Creating a custom format

Spectral supports two core formats: `oas2` and `oas3`. Using `registerFormat` you can add support for autodetecting other formats. You might want to do this for a ruleset which is run against multiple major versions of description format like RAML v0.8 and v1.0.

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

### Using custom resolver

Spectral lets you provide any custom $ref resolver. By default, http(s) and file protocols are resolved, relatively to the document Spectral lints against.
If you'd like support any additional protocol or adjust the resolution, you are absolutely fine to do it.
In order to achieve that, you need to create a custom json-ref-resolver instance.

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
