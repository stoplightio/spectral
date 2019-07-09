# Using Spectral programatically

## Example: Linting an OpenAPI document

Spectral includes a number of ready made rules and functions for OpenAPI v2 and v3 documents.

This example uses the OpenAPI v3 rules to lint a document.

```js
const { Spectral } = require('@stoplight/spectral');
const { oas3Functions, rules: oas3Rules } = require('@stoplight/spectral/rulesets/oas3');
// for YAML
const { parseWithPointers } = require("@stoplight/yaml");

// Uncomment to use parseWithPointers (remember to comment the next instance of myOAS)
// const myOAS = parseWithPointers(`
// responses:
//   '200':
//     description: ''
//     schema:
//       $ref: '#/definitions/error-response'
// `)

// an OASv3 document
const myOAS = {
  // ... properties in your document
  responses: {
    '200': {
      description: '',
      schema: {
        $ref: '#/definitions/error-response',
      },
    },
  },
  // ... properties in your document
};

// create a new instance of spectral with all of the baked in rulesets
const spectral = new Spectral();

spectral.addFunctions(oas3Functions());
oas3Rules()
  .then(rules => spectral.addRules(rules))
  .then(() => {
    spectral.addRules({
      // .. extend with your own custom rules
    });

    // run!
    spectral.run(myOAS).then(results => {
      console.log(JSON.stringify(results, null, 4));
    });
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

You can also [add to these rules](#Creating-a-custom-rule) to create a customized linting style guide for your OpenAPI documents.

The existing OAS rules are opinionated. There might be some rules that you prefer to change. We encourage you to create your rules to fit your use case. We welcome additions to the existing rulesets as well!

## Advanced

#### Creating a custom rule

Spectral has a built-in set of functions which you can reference in your rules. This example uses the `RuleFunction.PATTERN` to create a rule that checks that all property values are in snake case.

```javascript
const { RuleFunction, Spectral } = require('@stoplight/spectral');

const spectral = new Spectral();

spectral.addRules({
  snake_case: {
    description: 'Checks for snake case pattern',

    // evaluate every property
    given: '$..*',

    then: {
      function: RuleFunction.PATTERN,
      functionOptions: {
        match: '^[a-z]+[a-z0-9_]*[a-z0-9]+$',
      },
    },
  },
});

// run!
spectral.run({name: 'helloWorld',}).then(results => {
  console.log(JSON.stringify(results, null, 4));
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

#### Creating a custom function

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
