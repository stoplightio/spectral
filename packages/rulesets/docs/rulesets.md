# Rulesets

Rulesets are collections of rules written in JSON or YAML, which can be used to power powerful linting of other JSON or YAML files. Meta, we know! 😎

These rules are taking parameters, and calling functions on certain parts of another YAML or JSON object being linted.

## Anatomy of a Ruleset

A ruleset is a JSON or YAML file ([often the file will be called `.spectral.yaml`](../../cli/README.md#using-a-ruleset-file)), and there are two main parts.

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

Spectral has [built-in functions](../../functions/docs/core-functions.md) such as `truthy` or `pattern`, which can be used to power rules.

Rules then target certain chunks of the JSON/YAML with the `given` keyword, which is a [JSONPath](http://jsonpath.com/) (actually, we use [JSONPath Plus](https://www.npmjs.com/package/jsonpath-plus)).

The example above adds a single rule that looks at the root level `tags` object's children to make sure they all have a `description` property.

### Extending Rulesets

Rulesets can extend other rulesets using the `extends` property, allowing you to pull in other rulesets.

```yaml
extends: spectral:oas
```

Extends can reference any [distributed ruleset](./sharing-rulesets.md). It can be a single string, or an array of strings, and can contain either local file paths, URLs, or even NPM modules.

```yaml
extends:
  - ./config/spectral.json
  - https://example.org/api/style.yaml
  - some-npm-module
```

The `extends` keyword can be combined with extra rules in order to extend and override rulesets. Learn more about that in [custom rulesets](./custom-rulesets.md).

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to.

You can read more about that in [formats package](../formats/README.md).

## Core Rulesets

Spectral comes with two rulesets included:

- `spectral:oas` - [OpenAPI v2/v3 rules](./4-openapi.md)
- `spectral:asyncapi` - [AsyncAPI v2 rules](./5-asyncapi.md)

You can also make your own: read more about [Custom Rulesets](../rulesets/README.md).
