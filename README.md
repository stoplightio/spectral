# Spectral

[![Test Coverage](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/test_coverage)](https://codeclimate.com/github/stoplightio/spectral/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/maintainability)](https://codeclimate.com/github/stoplightio/spectral/maintainability)

## Features

- Create custom rules to lint _any JSON object_.
- Use JSON paths to apply rules / functions to specific parts of your JSON objects.
- Built-in set of functions to help build custom rules. Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc.
- Create custom functions for advanced use cases.
- Optional ready to use rules and functions to validate and lint OpenAPI v2 _and_ v3 documents.
- Validate JSON with [Ajv](https://github.com/epoberezkin/ajv).

## Installation

```shell
npm install @stoplight/spectral
```

Supports Node v8.3+ and modern browsers.

## Usage

There are two key concepts in Spectral: **Rules** and **Functions**.

- **Rules** filter your object down to a set of target values, and specify the function that should evaluate those values.
- **Functions** accept a value and return issue(s) if the value is incorrect.

Think of a set of **rules** and **functions** as a flexible and customizable style guide for your JSON objects.

### Creating a custom rule:

Spectral has a built-in set of functions which you can reference in your rules. This example uses the `RuleFunction.PATTERN` to create a rule that checks that all property values are in snake case.

```javascript
const { RuleFunction, Spectral } = require("@stoplight/spectral");

const spectral = new Spectral();

spectral.addRules({
  snake_case: {
    summary: "Checks for snake case pattern",

    // evaluate every property
    given: "$..*",

    then: {
      function: RuleFunction.PATTERN,
      functionOptions: {
        match: "^[a-z]+[a-z0-9_]*[a-z0-9]+$"
      }
    }
  }
});

const results = spectral.run({
  name: "helloWorld"
});

console.log(JSON.stringify(results, null, 4));

// => outputs a single result since `helloWorld` is not snake_case
// {
//   "results": [
//     {
//       "name": "snake_case",
//       "message": "must match the pattern '^[a-z]+[a-z0-9_]*[a-z0-9]+$'",
//       "severity": 50,
//       "severityLabel": "error",
//       "path": [
//         "name"
//       ]
//     }
//   ]
// }
```

### Creating a custom function:

Sometimes the built-in functions don't cover your use case. This example creates a custom function, `customNotThatFunction`, and then uses it within a rule, `openapi_not_swagger`. The custom function checks that you are not using a specific string (e.g., "Swagger") and suggests what to use instead (e.g., "OpenAPI").

```javascript
const { Spectral } = require("@stoplight/spectral");

// custom function
const customNotThatFunction = (targetValue, options) => {
  const { match, suggestion } = options;

  if (targetValue && targetValue.match(new RegExp(match))) {
    // return the single error
    return [
      {
        message: `Use ${suggestion} instead of ${match}!`
      }
    ];
  }
};

const spectral = new Spectral();

spectral.addFunctions({
  notThat: customNotThatFunction
});

spectral.addRules({
  openapi_not_swagger: {
    summary: "Checks for use of Swagger, and suggests OpenAPI.",

    // check every property
    given: "$..*",

    then: {
      // reference the function we added!
      function: "notThat",

      // pass it the options it needs
      functionOptions: {
        match: "Swagger",
        suggestion: "OpenAPI"
      }
    }
  }
});

const results = spectral.run({
  description: "Swagger is pretty cool!"
});

console.log(JSON.stringify(results, null, 4));

// => outputs a single result since we are using the term `Swagger` in our object
// {
//   "results": [
//     {
//       "name": "openapi_not_swagger",
//       "message": "Use OpenAPI instead of Swagger!",
//       "severity": 50,
//       "severityLabel": "error",
//       "path": [
//         "description"
//       ]
//     }
//   ]
// }
```

### Linting an OAS 2 document:

Spectral also includes a number of ready made rules and functions for OpenAPI 2 and 3 documents. This example uses the OpenAPI 2 rules to lint an OpenAPI 2 document.

You can also add to these rules to create a customized linting style guide for your OAS documents.

```javascript
const { Spectral } = require("@stoplight/spectral");
const {
  oas2Functions,
  oas2Rules
} = require("@stoplight/spectral/rulesets/oas2");

// an OASv2 document
var myOAS = {
  // ... properties in your document
  responses: {
    "200": {
      description: "",
      schema: {
        $ref: "#/definitions/error-response"
      }
    }
  }
  // ... properties in your document
};

// create a new instance of spectral with all of the baked in rulesets
const spectral = new Spectral();

spectral.addFunctions(oas2Functions());
spectral.addRules(oas2Rules());

spectral.addRules({
  // .. extend with your own custom rules
});

// run!
const results = spectral.run(myOAS);

console.log(JSON.stringify(results, null, 4));
```

Note: The existing OAS rules are opinionated. There might be some rules that you prefer to change. We encourage you to create your rules to fit your use case. We welcome additions to the existing rulesets as well!

### Example Implementations

- [Spectral Bot](https://github.com/tbarn/spectral-bot), a GitHub pull request bot that lints your repo's OAS document that uses the [Probot](https://probot.github.io) framework, built by [Taylor Barnett](https://github.com/tbarn)

## FAQs

**How is this different than [Ajv](https://github.com/epoberezkin/ajv)?**

Ajv is a JSON Schema validator, not a linter. Spectral does expose a `schema` function that you can use in your rules to validate all or part of the target object with JSON Schema (Ajv is used under the hood). However, Spectral also provides a number of other functions and utilities that you can use to build up a linting ruleset to validates things that JSON Schema is not well suited for.

**I want to lint my OpenAPI Specification documents but don't want to implement Spectral right now.**

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_campaign=spectral).

**What is the difference between Spectral and [Speccy](https://github.com/wework/speccy)?**

With Spectral, lint rules can be applied to _any_ JSON object, not just OAS 3 documents. The rule structure is different between the two. Spectral uses [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead of the `object` parameters (which are OAS-specific). Rules are also more clearly defined (thanks to TypeScript typings) and now require specifying a `type` parameter. Some rule types have been enhanced to be a little more flexible along with being able to create your own rules based on the built-in and custom functions.

## Contributing

If you are interested in contributing to Spectral itself, check out our [contributing docs](CONTRIBUTING.md) to get started.

If you are using Spectral in your open source project and want to be listed in the examples section, we encourage you to open an [issue](https://github.com/stoplightio/spectral/issues).

## Helpful Links

- [JSONPath Online Evaluator](http://jsonpath.com/), a helpful tool to determine what `path` you want
- [stoplightio/json](https://github.com/stoplightio/json), a library of useful functions for when working with JSON
- [stoplightio/yaml](https://github.com/stoplightio/yaml), a library of useful functions for when working with YAML, including parsing YAML into JSON with a source map that includes JSONPath pointers for every property in the result

## Thanks :)

- [Phil Sturgeon](https://github.com/philsturgeon) for collaboration and creating Speccy

## Support

If you have a bug or feature request, please open an issue [here](https://github.com/stoplightio/spectral/issues).

If you need help using Spectral or have a support question, please use the [Stoplight Community forum](https://community.stoplight.io). We've created an open source category for these questions. It's also a great place to share your implementations.

If you want to discuss something in private, you can reach out to Stoplight support at [support@stoplight.io](mailto:support@stoplight.io).
