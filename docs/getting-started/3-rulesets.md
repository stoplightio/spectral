# Rulesets

Rulesets are collections of rules written in JSON, YAML, or [JavaScript](../guides/4-custom-rulesets.md#alternative-js-ruleset-format), which can be used to power powerful linting of other JSON or YAML files, such as OpenAPI or AsyncAPI descriptions. Meta, we know! 😎

Ruleset files are often named `.spectral.yaml`, but that's not a requirement.

Rules take certain parameters and then call functions on parts of another YAML or JSON object being linted.

Here's what a rule might look like:

```yaml
rules:
  paths-kebab-case:
    description: Paths should be kebab-case.
    message: "{{property}} should be kebab-case (lower-case and separated with hyphens)"
    severity: warn
    given: $.paths[*]~
    then:
      function: pattern
      functionOptions:
        match: "^(\/|[a-z0-9-.]+|{[a-zA-Z0-9_]+})+$"
```

The example above is a single rule that can be used in an OpenAPI description. It will look at all the `paths` properties to make sure they are kebab-case (lower-case and separated with hyphens).

Breaking down each part of the rule:

- `description` and `message` will help users quickly understand what the goal of the rule is
- `severity` will help define the importance of following the rule
- The `given` keyword tells Spectral what part of the JSON or YAML file to target by using [JSONPath](http://jsonpath.com/) (Spectral uses [JSONPath Plus](https://www.npmjs.com/package/jsonpath-plus)).
- The `then` property includes the `function` type and options that tells Spectral how to apply the function to the JSON or YAML file, and make sure that the rule is being followed or not. Spectral has a set of [built-in functions](../reference/functions.md) such as `truthy` or `pattern`, which can be used to power rules.

### JSONPath Plus

As mentioned, Spectral uses JSONPath Plus which expands on the original JSONPath specification to add some additional operators and makes explicit some behaviors the original did not spell out.

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

### Extending Rulesets

Rulesets can extend other rulesets using the `extends` property, allowing you to pull in other rulesets.

```yaml
extends: spectral:oas
```

Extends can reference any [distributed ruleset](../guides/7-sharing-rulesets.md). It can be a single string, or an array of strings, and can contain either local file paths, URLs, or even npm modules.

```yaml
extends:
  - ./config/spectral.json
  - https://example.org/api/style.yaml
  - some-npm-module # note that this would be treated as any other npm package, therefore it has to be placed under node_modules and have a valid package.json.
```

The `extends` keyword can be combined with extra rules in order to extend and override rulesets. Learn more about that in [custom rulesets](../guides/4-custom-rulesets.md).

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these formats:

- `aas2` (AsyncAPI v2.x)
- `aas2_0` (AsyncAPI v2.0.0)
- `aas2_1` (AsyncAPI v2.1.0)
- `aas2_2` (AsyncAPI v2.2.0)
- `aas2_3` (AsyncAPI v2.3.0)
- `aas2_4` (AsyncAPI v2.4.0)
- `aas2_5` (AsyncAPI v2.5.0)
- `oas2` (OpenAPI v2.0)
- `oas3` (OpenAPI v3.x)
- `oas3_0` (OpenAPI v3.0.x)
- `oas3_1` (OpenAPI v3.1.x)
- `json-schema` (`$schema` says this is some JSON Schema draft)
- `json-schema-loose` (looks like JSON Schema, but no `$schema` found)
- `json-schema-draft4` (`$schema` says this is JSON Schema Draft 04)
- `json-schema-draft6` (`$schema` says this is JSON Schema Draft 06)
- `json-schema-draft7` (`$schema` says this is JSON Schema Draft 07)
- `json-schema-2019-09` (`$schema` says this is JSON Schema 2019-09)
- `json-schema-2020-12` (`$schema` says this is JSON Schema 2020-12)

Specifying the format is optional, so you can completely ignore this if all the rules you are writing apply to any document you lint, or if you have specific rulesets for different formats. If you'd like to use one ruleset for multiple formats, the `formats` key is here to help.

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

## Core Rulesets

Spectral comes with two rulesets included:

- `spectral:oas` - [OpenAPI v2/v3 rules](./4-openapi.md)
- `spectral:asyncapi` - [AsyncAPI v2 rules](./5-asyncapi.md)

You can also make your own: read more about [Custom Rulesets](../guides/4-custom-rulesets.md).
