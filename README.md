# spectral

> **Warning** This is still a prototype and not ready for general use.

This is an enhanced version of the [speccy](https://github.com/wework/speccy)
project. Differences between this project and speccy include:

- Lint rules can be applied to _any_ JSON object, not just OAS3 specifications.

- All dependencies on the [oas-kit](https://github.com/Mermade/oas-kit/)
  repository have been removed, since rules are no longer OAS-specific.

- The rule structure has been modified slightly to use
  [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead
  of the `object` parameters (which were OAS-specific).

- Rules are more clearly defined (thanks to TypeScript typings) and now require
  specifying a `type` parameter.

- Some rule types have been enhanced to be a little more flexible. An example of
  this includes the ability to specify the object to be linted in the `path`
  parameter itself, instead of relying on rule-specific options to be applied.

- Ported to TypeScript.

Things that speccy has, but spectral does not (though they would be easy to add):

- A 'server' and CLI mode

- The ability to add rules from file

- The ability for rule files to specify a dependency on other rule files

## Usage

```typescript
// an OAS specification
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

// create a new linter
const linter = new lint.Linter();
// register a rule
linter.registerRules([
  {
    type: 'pattern',
    name: 'all-responses-must-be-numeric',
    path: '$..responses',
    enabled: true,
    description: 'responses should all be numeric, aka match the regex ^[0-9]+',
    pattern: {
      property: '*',
      value: '^[0-9]+$',
    }
  }
]);

// lint!
console.log(linter.lint(oas));

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

## Helpful Links

- [JSONPath Tester](https://jsonpath.curiousconcept.com/)
