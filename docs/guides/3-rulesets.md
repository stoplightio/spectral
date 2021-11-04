# Rulesets

Rulesets are collections of rules written in JSON or YAML, which can be used to power linting of other JSON or YAML files. Meta, we know! 😎

These rules take parameters and call functions on certain parts of another YAML or JSON object being linted.

## Anatomy of a Ruleset

A ruleset is a JSON or YAML file ([often the file will be called `.spectral.yaml`](../getting-started/3-load-ruleset.md)), and there are two main parts.

### Rules

Rules might look a bit like this:

```yaml
rules:
  my-rule-name:
    description: Tags must have a description.
    given: $.tags[*]
    severity: error
    then:
      field: description
      function: truthy
```

Spectral has [built-in functions](../reference/functions.md) such as `truthy` or `pattern`, which can be used to power rules.

Rules then target certain chunks of the JSON/YAML with the `given` keyword, which is a [JSONPath](http://jsonpath.com/) (actually, we use [JSONPath Plus](https://www.npmjs.com/package/jsonpath-plus)).

The example above adds a single rule that looks at the root level `tags` object's children to make sure they all have a `description` property.

### JSONPath Plus

As mentioned, spectral is using JSONPath Plus which expands on the original JSONPath specification to add some additional operators and makes explicit some behaviors the original did not spell out.

Here are some convenient **additions or elaborations**:

- `^` for grabbing the **parent** of a matching item
- `~` for grabbing **property names** of matching items (as array)
- **Type selectors** for obtaining:
  - Basic JSON types: `@null()`, `@boolean()`, `@number()`, `@string()`, `@array()`, `@object()`
  - `@integer()`
  - The compound type `@scalar()` (which also accepts `undefined` and
    non-finite numbers when querying JavaScript objects as well as all of the basic non-object/non-function types)
  - `@other()` usable in conjunction with a user-defined `otherTypeCallback`
  - Non-JSON types that can nevertheless be used when querying
    non-JSON JavaScript objects (`@undefined()`, `@function()`, `@nonFinite()`)
- `@path`/`@parent`/`@property`/`@parentProperty`/`@root` **shorthand selectors** within filters
- **Escaping**
  - `` ` `` for escaping remaining sequence
  - `@['...']`/`?@['...']` syntax for escaping special characters within
    property names in filters
- Documents `$..` (**getting all parent components**)

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these formats:

- `asyncapi2` (AsyncAPI v2.0)
- `oas2` (OpenAPI v2.0)
- `oas3` (OpenAPI v3.x)
- `oas3.0` (OpenAPI v3.0.x)
- `oas3.1` (OpenAPI v3.1.x)
- `json-schema` (`$schema` says this is some JSON Schema draft)
- `json-schema-loose` (looks like JSON Schema, but no `$schema` found)
- `json-schema-draft4` (`$schema` says this is JSON Schema Draft 04)
- `json-schema-draft6` (`$schema` says this is JSON Schema Draft 06)
- `json-schema-draft7` (`$schema` says this is JSON Schema Draft 07)
- `json-schema-2019-09` (`$schema` says this is JSON Schema 2019-09)
- `json-schema-2020-12` (`$schema` says this is JSON Schema 2020-12)

Specifying the format is optional, so you can completely ignore this if all the rules you are writing apply to any document you lint, or if you have specific rulesets for different formats. If you'd like to use one ruleset for multiple formats, the formats key is here to help.

```yaml
rules:
  oas3-api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    formats: ["oas3"]
    given: "$"
    then:
      field: servers
      function: schema
      functionOptions:
        schema:
          items:
            type: object
          minItems: 1
          type: array
```

Specifying the format is optional, so you can completely ignore this if all the rules you are writing apply to any document you lint, or if you have specific rulesets for different formats.

Formats can be specified at the ruleset level:

```yaml
formats: ["oas3"]
rules:
  oas3-api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    given: "$"
    then:
      # ...
```

Now all the rules in this ruleset will only be applied if the specified format is detected.

If you'd like to use one ruleset for multiple formats but some rules only apply to one format, you can place the `formats` keyword at the rule level instead:

```yaml
rules:
  oas3-api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    formats: ["oas3"]
    given: "$"
    then:
      # ...
  oas2-hosts:
    description: "OpenAPI `servers` must be present and non-empty array."
    formats: ["oas2"]
    given: "$"
    then:
      # ...
```

Custom formats can be registered via the [JS API](../guides/3-javascript.md), but the [CLI](../guides/2-cli.md) is limited to using the predefined formats.

