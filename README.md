# Spectral

### Features

- Linting and rule engine that be applied to _any JSON object_, including OpenAPI Specification 2 and 3 documents
- TODO: Explain more

##### Examples:
- Create API design style guides using Spectral for linting
- Validate JSON documents against a JSON schema specification
- TODO: another example

## Installation

```shell
npm install @stoplight/spectral
```

## Usage

### JavaScript (Node.js) with OAS 2 example:

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

//  [ {
//   path: '$.responses',
//   rule:
//     { type: 'pattern',
//       name: 'all-responses-must-be-numeric',
//       path: '$..responses',
//       enabled: true,
//       description: 'reference components should all match regex ^[0-9]+',
//       pattern: { property: '*', value: '^[0-9]+$' } },
//     error:
//       Error {
//         operator: 'to be',
//         expected: true,
//         message: 'reference components should all match regex ^[0-9]+',
//         showDiff: true,
//         actual: false,
//         stackStartFunction: [Function: assert],
//         negate: false,
//         assertion:
//         Assertion {
//           obj: false,
//           anyOne: false,
//           negate: false,
//           params: [Object],
//           onlyThis: undefined,
//           light: false } } } ]
```

### TypeScript with OAS 2 example:

```typescript
import { Spectral } from '@stoplight/spectral';
import { defaultRuleset } from '@stoplight/spectral/rulesets';

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

//  [ {
//   path: '$.responses',
//   rule:
//     { type: 'pattern',
//       name: 'all-responses-must-be-numeric',
//       path: '$..responses',
//       enabled: true,
//       description: 'reference components should all match regex ^[0-9]+',
//       pattern: { property: '*', value: '^[0-9]+$' } },
//     error:
//       Error {
//         operator: 'to be',
//         expected: true,
//         message: 'reference components should all match regex ^[0-9]+',
//         showDiff: true,
//         actual: false,
//         stackStartFunction: [Function: assert],
//         negate: false,
//         assertion:
//         Assertion {
//           obj: false,
//           anyOne: false,
//           negate: false,
//           params: [Object],
//           onlyThis: undefined,
//           light: false } } } ]
```

## Example Implementations

- [Spectral Bot](https://github.com/tbarn/spectral-bot), a GitHub pull request bot using the [Probot](https://probot.github.io) framework, built by [Taylor Barnett](https://github.com/tbarn)

## FAQs

**I want to lint my OpenAPI Specification documents but don't want to implement Spectral right now.**

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_campaign=spectral).

**What is the difference between Spectral and [Speccy](https://github.com/wework/speccy)?**

With Spectral, lint rules can be applied to _any_ JSON object, not just OAS 3 documents. The rule structure is different between the two. Spectral uses [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead of the `object` parameters (which are OAS-specific). Rules are also more clearly defined (thanks to TypeScript typings) and now require specifying a `type` parameter. Some rule types have been enhanced to be a little more flexible.

## Contributing

Most of the interesting projects are built _with_ Spectral. Please consider using Spectral in a project or contribute to an [existing one](#example-implementations). If you would like to add your project to our examples, we encourage you to open an [issue](https://github.com/stoplightio/spectral/issues).

We also love to help and support contributors! If you are interesting in contributing to Spectral itself, check out our [contributing docs](CONTRIBUTING.md) to get started.

## Helpful Links

- [JSONPath Tester](https://jsonpath.curiousconcept.com/)
- [Library of useful functions for when working with JSON](https://github.com/stoplightio/json)
- [Library of useful functions for when working with YAML](https://github.com/stoplightio/yaml)

## Credits

- [Phil Sturgeon](https://github.com/philsturgeon) for collaboration and creating Speccy
- [Ross McDonald](https://github.com/rossmcdonald) for creating the initial version of Spectral

## Support

If you have a bug or feature request, please open an issue [here](https://github.com/stoplightio/spectral/issues).

If you need help using Spectral or have a support question, please use the [Stoplight Community forum](https://community.stoplight.io). We've created an open source category for these questions. It's also a great place to share your implementations.

Lastly, if you want to discuss something in private, you can reach out to Stoplight support at [support@stoplight.io](mailto:support@stoplight.io).
