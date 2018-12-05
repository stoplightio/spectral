# Spectral

[![Maintainability](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/maintainability)](https://codeclimate.com/github/stoplightio/spectral/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/test_coverage)](https://codeclimate.com/github/stoplightio/spectral/test_coverage)

## Features

- Allows you to create custom rules to lint _any JSON object_
- Built-in set of functions to help build custom rules, like for patterns, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc.
- Existing rulesets for OpenAPI Specification (OAS) 2 _and_ 3 documents
- Validates JSON with [Ajv](https://github.com/epoberezkin/ajv)

## Installation

```shell
npm install @stoplight/spectral
```

Supports Node v8.3+

## Usage

### Creating a custom rule and ruleset example:

Spectral has a built-in set of functions, which you can write your own rules with. This example uses the `RuleFunction.PATTERN` to create a rule that checks that all property values are in snake case.

```javascript
const { Spectral } = require("@stoplight/spectral");

const rulesets = {
  rulesets: [
    {
      rules: {
        mySpec: {
          snake_case: {
            type: RuleType.STYLE,
            enabled: true,
            summary: 'Checks for snake case pattern',
            function: RuleFunction.PATTERN,
            path: '$..*',
            input: {
              property: '*',
              value: '^[a-z]+[a-z0-9_]*[a-z0-9]+$',
            },
          },
        },
      },
    },
  ],
};

const spectral = new Spectral(rulesets);

// results would return a style warning because it is not in snake case pattern
const results = spectral.run({
  spec: 'mySpec',
  target: {
    name: 'helloWorld',
  },
});
```

### Creating a custom function, rule, and ruleset example:

Sometimes the built-in functions aren't what you need to build a custom rule. This example creates a custom function, `customNotThatFunction`, and then uses it within a rule, `openapi_not_swagger_`. The custom function checks that you are not using a specific string (e.g., "Swagger") and suggests what to use instead (e.g., "OpenAPI").

```javascript
const { Spectral } = require("@stoplight/spectral");

// custom function
const customNotThatFunction = (opts: any) => {
  const results = [];

  const { object, rule, meta } = opts;
  const { that, suggestion } = rule.input;

  const res = ensureRule(() => {
    object.should.match(new RegExp(that), `Don't use ${that}, use ${suggestion}!`);
  }, meta);

  if (res) {
    results.push(res);
  }

  return results;
};

//custom rule and ruleset
const spectral = new Spectral({
  rulesets: [
    {
      rules: {
        mySpec: {
          openapi_not_swagger: {
            type: RuleType.STYLE,
            enabled: true,
            summary: 'Checks for use of Swagger, and suggests OpenAPI.',
            function: 'notThat',
            path: '$..*',
            input: {
              that: '/Swagger/g',
              suggestion: 'OpenAPI',
            },
          },
        },
      },
      functions: {
        notThat: customNotThatFunction,
      },
    },
  ],
});

// results would return a style warning because you used "Swagger" instead of "OpenAPI"
const results = spectral.run({
  spec: 'mySpec',
  target: {
    description: 'Swagger is pretty cool!',
  },
});
```

### Linting an OAS 2 document example:

Spectral also has existing rulesets that we have created for OAS 2 and 3. This example uses an existing ruleset to lint an OAS 2 document.

You can also build on top of these rulesets for a customized linting style guide for your OAS documents.

```javascript
const { Spectral } = require("@stoplight/spectral");
const { defaultRuleset } = require('@stoplight/spectral/lib/rulesets');

// an OASv2 specification
var myOAS = {
  [...]
  responses: {
    '401asdf': {
      description: '',
      schema: {
        $ref: '#/definitions/error-response',
      },
    },
  },
  [...]
};

// create a new instance of spectral with all of the baked in rulesets
const spectral = new Spectral({ rulesets: [defaultRuleset()] });

// run!
console.log(spectral.run({ spec: 'oas2', target: myOAS }));
```

Note: The existing OAS rulesets are opinionated. There might be some rules that you prefer to change. We encourage you to create your rulesets to fit your use case. We welcome contributions to the existing rulesets too!

### Example Implementations

- [Spectral Bot](https://github.com/tbarn/spectral-bot), a GitHub pull request bot that lints your repo's OAS document that uses the [Probot](https://probot.github.io) framework, built by [Taylor Barnett](https://github.com/tbarn)

## FAQs

**How is this different than [Ajv](https://github.com/epoberezkin/ajv)?**

Ajv is a JSON Schema validator, not a linter. While Spectral runs your JSON objects through Ajv and returns the result to ensure you are using valid JSON, it goes a level beyond that and allows you to build a custom ruleset that lints your JSON objects.

**I want to lint my OpenAPI Specification documents but don't want to implement Spectral right now.**

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_campaign=spectral).

**What is the difference between Spectral and [Speccy](https://github.com/wework/speccy)?**

With Spectral, lint rules can be applied to _any_ JSON object, not just OAS 3 documents. The rule structure is different between the two. Spectral uses [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead of the `object` parameters (which are OAS-specific). Rules are also more clearly defined (thanks to TypeScript typings) and now require specifying a `type` parameter. Some rule types have been enhanced to be a little more flexible along with being able to create your own rules based on the built-in and custom functions.

## Contributing

Most of the interesting projects are built _with_ Spectral. Please consider using Spectral in a project or contribute to an [existing one](#example-implementations). If you would like to add your project to our examples, we encourage you to open an [issue](https://github.com/stoplightio/spectral/issues).

We also love to help and support contributors! If you are interested in contributing to Spectral itself, check out our [contributing docs](CONTRIBUTING.md) to get started.

## Helpful Links

- [JSONPath Online Evaluator](http://jsonpath.com/), a helpful tool to determine what `path` you want
- [stoplightio/json](https://github.com/stoplightio/json), a library of useful functions for when working with JSON
- [stoplightio/yaml]((https://github.com/stoplightio/yaml)), a library of useful functions for when working with YAML, including parsing YAML into JSON with a source map that includes JSONPath pointers for every property in the result

## Credits

- [Phil Sturgeon](https://github.com/philsturgeon) for collaboration and creating Speccy
- [Ross McDonald](https://github.com/rossmcdonald) for creating the initial version of Spectral

## Support

If you have a bug or feature request, please open an issue [here](https://github.com/stoplightio/spectral/issues).

If you need help using Spectral or have a support question, please use the [Stoplight Community forum](https://community.stoplight.io). We've created an open source category for these questions. It's also a great place to share your implementations.

Lastly, if you want to discuss something in private, you can reach out to Stoplight support at [support@stoplight.io](mailto:support@stoplight.io).
