# Rulesets

Rulesets are collections of rules written in JSON, YAML, or [JavaScript](../guides/4-custom-rulesets.md#alternative-js-ruleset-format), which can be used to power powerful linting of other JSON or YAML files, such as OpenAPI or AsyncAPI descriptions. Meta, we know! 😎

Ruleset files are often named `.spectral.yaml`, but that's not a requirement.

Rules take certain parameters and then call functions on parts of another YAML or JSON object being linted.

## Create a Ruleset

The fastest way to create a ruleset is to use the `extends` property to leverage an existing ruleset.

Spectral comes with two built-in rulesets:

- `spectral:oas` - [OpenAPI v2/v3 rules](./4-openapi.md)
- `spectral:asyncapi` - [AsyncAPI v2 rules](./5-asyncapi.md)

To create a ruleset that extends both rulesets, in your terminal run:

```bash
echo 'extends: ["spectral:oas", "spectral:asyncapi"]' > .spectral.yaml
```

The newly created ruleset file can then be used to lint any OpenAPI v2/v3 or AsyncAPI descriptions.

## Write Your First Rule

Here's what a ruleset with a single rule might look like:

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

The example above is a rule that can be used to validate an OpenAPI description. It will look at all the `paths` properties to make sure they are kebab-case (lower-case and separated with hyphens).

Breaking down each part of the rule:

- `description` and `message` will help users quickly understand what the goal of the rule is
- `severity` will help define the importance of following the rule
- The `given` keyword tells Spectral what part of the JSON or YAML file to target by using [JSONPath](http://jsonpath.com/) (Spectral uses [JSONPath Plus](https://www.npmjs.com/package/jsonpath-plus)).
- The `then` property includes the `function` type and options that tells Spectral how to apply the function to the JSON or YAML file, and make sure that the rule is being followed or not. Spectral has a set of [built-in functions](../reference/functions.md) such as `truthy` or `pattern`, which can be used to power rules.

## Next Steps

For more information about creating Rulesets and Rules, see [Custom Rulesets](../guides/4-custom-rulesets.md).

## Ruleset Properties

There are three properties that can be used at the root level of a ruleset:

- `rules` (required): An array of rules.
- `formats` (optional): The format that the ruleset should apply to. For example `oas3` for any OpenAPI v3.x descriptions.
- `extends` (optional): A reference to other rulesets. Used to extend and customize existing rulesets.

## Core Rulesets

Spectral comes with two rulesets included:

- `spectral:oas` - [OpenAPI v2/v3 rules](./4-openapi.md)
- `spectral:asyncapi` - [AsyncAPI v2 rules](./5-asyncapi.md)

You can also make your own: read more about [Custom Rulesets](../guides/4-custom-rulesets.md).

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
