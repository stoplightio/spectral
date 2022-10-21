# Extending Rulesets

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

The `extends` keyword can be combined with extra rules to extend and override rulesets. Learn more about that in [custom rulesets](../guides/4-custom-rulesets.md).

## Modify Rules

When extending another ruleset, you can replace a rule defined in that ruleset by adding a new rule to your own ruleset with the same name.

```yaml
extends: spectral:oas
rules:
  tag-description:
    description: Please provide a description for each tag.
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

This provides a new description, but anything can be changed.

If you're just looking to change the severity of the rule, there's a handy shortcut.

## Change Rule Severity

Maybe you want to use the rules from the `spectral:oas` ruleset, but instead of `operation-success-response` triggering an error you'd like it to trigger a warning instead.

```yaml
extends: spectral:oas
rules:
  operation-success-response: warn
```

See [Severity](./4a-rules.md#severity) for more details.
