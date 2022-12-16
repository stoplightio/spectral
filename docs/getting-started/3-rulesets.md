# Create a Ruleset

Rulesets are collections of rules written in JSON, YAML, or [JavaScript](../guides/4-custom-rulesets.md#alternative-js-ruleset-format). Rulesets provide powerful linting of other JSON or YAML files, such as OpenAPI or AsyncAPI descriptions.

Ruleset files are often named `.spectral.yaml`, but that's not a requirement.

Rules take certain parameters and then call functions on parts of another YAML or JSON object being linted.

## Extend an Existing Ruleset

The fastest way to create a ruleset is to use the `extends` property to leverage an existing ruleset.

Spectral comes with two built-in rulesets:

- `spectral:oas` - [OpenAPI v2/v3 rules](./4-openapi.md)
- `spectral:asyncapi` - [AsyncAPI v2 rules](./5-asyncapi.md)

To create a ruleset that extends both rulesets, open your terminal and run:

```bash
echo 'extends: ["spectral:oas", "spectral:asyncapi"]' > .spectral.yaml
```

The newly created ruleset file can then be used to lint any OpenAPI v2/v3 or AsyncAPI descriptions using the `spectral lint` command:

```bash
spectral lint myapifile.yaml
```

## Write Your First Rule

Here's an example of a ruleset with a single rule:

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

The example rule validates an OpenAPI description by ensuring the `paths` properties uses kebab-case (lower-case and separated with hyphens).

Breaking down each part of the rule:

- `description` and `message` help users quickly understand what the goal of the rule is
- `severity` help define the importance of following the rule
- The `given` keyword tells Spectral what part of the JSON or YAML file to target by using [JSONPath](http://jsonpath.com/) (Spectral uses [JSONPath Plus](https://www.npmjs.com/package/jsonpath-plus)).
- The `then` property includes the `function` type and options that tells Spectral how to apply the function to the JSON or YAML file, and make sure that the rule is being followed or not. Spectral has a set of [built-in functions](../reference/functions.md) such as `truthy` or `pattern`, which can be used to power rules.

## Next Steps

For more information about creating Rulesets and Rules, see [Custom Rulesets](../guides/4-custom-rulesets.md).

For more examples of existing rulesets you can use, see [Real-World Rulesets](../../README.md#-real-world-rulesets).
