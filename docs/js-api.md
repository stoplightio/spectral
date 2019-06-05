# Using Spectral programatically

## Example: Linting an OpenAPI document

Spectral includes a number of ready made rules and functions for OpenAPI v2 and v3 documents.

This example uses the OpenAPI v3 rules to lint a document.

```js
const { Spectral } = require('@stoplight/spectral');
const { oas3Functions, rules: oas3Rules } = require('@stoplight/spectral/rulesets/oas3');
// for YAML
const { parseWithPointers } = require("@stoplight/yaml");

// Using the anonymous async wrapper for the sake of the example.
const myOAS = parseWithPointers(`
responses:
  '200':
    description: ''
    schema:
      $ref: '#/definitions/error-response'
`)

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
    summary: 'Checks for snake case pattern',

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

// => outputs a single result since `helloWorld` is not snake_case
// [
//   {
//     "code": "snake_case",
//     "message": "must match the pattern '^[a-z]+[a-z0-9_]*[a-z0-9]+$'",
//     "severity": 1,
//     "path": [
//       "name"
//     ]
//   }
// ]
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
    summary: 'Checks for use of Swagger, and suggests OpenAPI.',

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

// => outputs a single result since we are using the term `Swagger` in our object
// [
//   {
//     "code": "openapi_not_swagger",
//     "message": "Use OpenAPI instead of Swagger!",
//     "severity": 1,
//     "path": [
//       "description"
//     ]
//   }
// ]
```
