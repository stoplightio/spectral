# Spectral in JavaScript

The Spectral CLI is a thin wrapper around a JavaScript (TypeScript) API, which can be used independently to do all the same things outside of the CLI.

Assuming it has been installed as a Node module via NPM/Yarn, it can be used to lint YAML and JSON documents from a string, or from an object.

## Linting a YAML string

```js
const { Spectral } = require('@stoplight/spectral');
const { parseWithPointers } = require("@stoplight/yaml");

const myOpenApiDocument = parseWithPointers(`
responses:
  '200':
    description: ''
    schema:
      $ref: '#/definitions/error-response'
`);

// create a new instance of spectral with all of the baked in rulesets
const spectral = new Spectral();
spectral.run(myOpenApiDocument).then(results => console.log(results);
```

Please note that by default Spectral supports YAML 1.2 with merge keys extension.

This will run Spectral with no rules or functions, so it's not going to do anything. Find out how to add rules and functions below.

## Linting an Object

Instead of passing a string to `parseWithPointers`, you can pass in JavaScript object, with or without `$ref`'s.

```js
const { Spectral } = require('@stoplight/spectral');
const { parseWithPointers } = require("@stoplight/yaml");

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
spectral.run(myOpenApiDocument).then(results => console.log(results);
```

## Loading Rules

Spectral comes with some rulesets that are very specific to OpenAPI v2/v3, and they can be loaded using `Spectral.loadRuleset()`. 

```js
const { Spectral } = require('@stoplight/spectral');
const { parseWithPointers } = require("@stoplight/yaml");

const myOpenApiDocument = {
  // any parsed open api document
};

const spectral = new Spectral();
spectral.loadRuleset('spectral:oas3') // spectral:oas2 for OAS 2.0 aka Swagger
  .then(() => spectral.run(myOpenApiDocument))
  .then(results => {
    console.log('here are the results', results);
  });
``` 

[Try it out!](https://repl.it/@ChrisMiaskowski/spectral-rules-example)

<details><summary>Click to see the output</summary>
<p>

```bash
[
    {
        "code": "invalid-ref",
        "path": [
            "responses",
            "200",
            "schema",
            "$ref"
        ],
        "message": "'#/definitions/error-response' does not exist",
        "severity": 0,
        "range": {
            "start": {
                "line": 5,
                "character": 16
            },
            "end": {
                "line": 5,
                "character": 46
            }
        }
    },
    {
        "code": "info-contact",
        "message": "Info object should contain `contact` object.",
        "path": [
            "info",
            "contact"
        ],
        "severity": 1,
        "range": {
            "start": {
                "line": 0,
                "character": 0
            },
            "end": {
                "line": 5,
                "character": 46
            }
        }
    },
    {
        "code": "info-description",
        "message": "OpenAPI object info `description` must be present and non-empty string.",
        "path": [
            "info",
            "description"
        ],
        "severity": 1,
        "range": {
            "start": {
                "line": 0,
                "character": 0
            },
            "end": {
                "line": 5,
                "character": 46
            }
        }
    },
    {
        "code": "oas3-schema",
        "message": "should NOT have additional properties: responses",
        "path": [],
        "severity": 0,
        "range": {
            "start": {
                "line": 0,
                "character": 0
            },
            "end": {
                "line": 5,
                "character": 46
            }
        }
    },
    {
        "code": "api-servers",
        "message": "OpenAPI `servers` must be present and non-empty array.",
        "path": [
            "servers"
        ],
        "severity": 1,
        "range": {
            "start": {
                "line": 0,
                "character": 0
            },
            "end": {
                "line": 5,
                "character": 46
            }
        }
    }
]
```

</p>
</details>

The OpenAPI rules are opinionated. There might be some rules that you prefer to change. We encourage you to create your rules to fit your use case. We welcome additions to the existing rulesets as well!

## Advanced

### Creating a custom rule

Spectral has a built-in set of functions which you can reference in your rules. This example uses the `RuleFunction.PATTERN` to create a rule that checks that all property values are in snake case.

```javascript
const { Spectral } = require('@stoplight/spectral');

const spectral = new Spectral();

spectral.addRules({
  snake_case: {
    description: 'Checks for snake case pattern',

    // evaluate every property
    given: '$..*',

    then: {
      function: 'pattern',
      functionOptions: {
        match: '^[a-z]+[a-z0-9_]*[a-z0-9]+$',
      },
    },
  },
});

// run!
spectral.run({name: 'helloWorld',}).then(results => {
  console.log(results);
});
```

[Try it out!](https://repl.it/@ChrisMiaskowski/spectral-pattern-example)

```bash
[
    {
        "code": "snake_case",
        "message": "Checks for snake case pattern",
        "path": [
            "name"
        ],
        "severity": 1,
        "range": {
            "start": {
                "line": 1,
                "character": 10
            },
            "end": {
                "line": 1,
                "character": 22
            }
        }
    }
]
```

### Creating a custom function

Sometimes the built-in functions don't cover your use case. This example creates a custom function, `customNotThatFunction`, and then uses it within a rule, `openapi_not_swagger`. The custom function checks that you are not using a specific string (e.g., "Swagger") and suggests what to use instead (e.g., "OpenAPI").

```javascript
const { Spectral } = require('@stoplight/spectral');

// custom function
const customNotThatFunction = (targetValue, options) => {
  const { match, suggestion } = options;

  if (targetValue && targetValue.match(new RegExp(match))) {
    // return the single error
    return [
      {
        message: `Use ${suggestion} instead of ${match}!`,
      },
    ];
  }
};

const spectral = new Spectral();

spectral.addFunctions({
  notThat: customNotThatFunction,
});

spectral.addRules({
  openapi_not_swagger: {
    description: 'Checks for use of Swagger, and suggests OpenAPI.',

    // check every property
    given: '$..*',

    then: {
      // reference the function we added!
      function: 'notThat',

      // pass it the options it needs
      functionOptions: {
        match: 'Swagger',
        suggestion: 'OpenAPI',
      },
    },
  },
});

// run!
spectral.run({description: 'Swagger is pretty cool!',}).then(results => {
  console.log(JSON.stringify(results, null, 4));
});
```

[Try it out!](https://repl.it/@ChrisMiaskowski/spectral-custom-function-example)

```bash
# Outputs a single result since we are using the term `Swagger` in our object
[
    {
        "code": "openapi_not_swagger",
        "message": "Checks for use of Swagger, and suggests OpenAPI.",
        "path": [
            "description"
        ],
        "severity": 1,
        "range": {
            "start": {
                "line": 1,
                "character": 17
            },
            "end": {
                "line": 1,
                "character": 42
            }
        }
    }
]
```

For more information on creating rules, read about [rulesets](../getting-started/rulesets.md).

### Creating a custom format

Spectral supports two core formats: `oas2` and `oas3`. Using `registerFormat` you can add support for autodetecting other formats. You might want to do this for a ruleset which is run against multiple major versions of description format like RAML v0.8 and v1.0.

```js
spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);

spectral.addRules({
  rule1: {
    given: '$.x',
    formats: ['foo-bar'],
    severity: 'error',
    then: {
      function: 'truthy',
    },
  }
});

const result = await spectral.run({
  'foo-bar': true,
  x: false
});

expect(result).toEqual([
  expect.objectContaining({
    code: 'rule1',
  }),
]);
```
