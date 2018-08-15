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

## Helpful Links

- [JSONPath Tester](https://jsonpath.curiousconcept.com/)
