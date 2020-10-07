# Rulesets

Rulesets are collections of rules written in JSON or YAML, which can be used to power powerful linting of other JSON or YAML files. Meta, we know! 😎

These rules are taking parameters, and calling functions on certain parts of another YAML or JSON object being linted.

## Anatomy of a Ruleset

A ruleset is a JSON or YAML file ([often the file will be called `.spectral.yaml`](../guides/2-cli.md#using-a-ruleset-file)), and there are two main parts.

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

### Extending Rulesets

Rulesets can extend other rulesets using the `extends` property, allowing you to pull in other rulesets.

```yaml
extends: spectral:oas
```

Extends can reference any [distributed ruleset](../guides/7-sharing-rulesets.md). It can be a single string, or an array of strings, and can contain either local file paths, URLs, or even NPM modules.

```yaml
extends:
  - ./config/spectral.json
  - https://example.org/api/style.yaml
  - some-npm-module
```

The `extends` keyword can be combined with extra rules in order to extend and override rulesets. Learn more about that in [custom rulesets](../guides/4-custom-rulesets.md).

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these formats:

- `asyncapi2` (AsyncAPI v2.0)
- `oas2` (OpenAPI v2.0)
- `oas3` (OpenAPI v3.0)
- `json-schema` (`$schema` says this is some JSON Schema draft)
- `json-schema-loose` (looks like JSON Schema, but no `$schema` found)
- `json-schema-draft4` (`$schema` says this is JSON Schema Draft 04)
- `json-schema-draft6` (`$schema` says this is JSON Schema Draft 06)
- `json-schema-draft7` (`$schema` says this is JSON Schema Draft 07)
- `json-schema-2019-09` (`$schema` says this is JSON Schema 2019-09)

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

## Core Rulesets

Spectral comes with two rulesets included:

- `spectral:oas` - [OpenAPI v2/v3 rules](./4-openapi.md)
- `spectral:asyncapi` - [AsyncAPI v2 rules](./5-asyncapi.md)

You can also make your own: read more about [Custom Rulesets](../guides/4-custom-rulesets.md).
