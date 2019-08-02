# Spectral Rulesets

Rulesets are collections of rules, in a YAML or JSON file. These rules are taking parameters, and calling functions on certain parts of another YAML or JSON object being linted. 

### Adding a rule

Add your own rules under the `rules` property in your `.spectral.yml` ruleset file.

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

The example above adds a single rule that checks that tags objects have a description property defined.

Running `spectral lint` on the following object with the ruleset above will result in an error being reported, since the tag does not have a description:

```json
{
  "tags": [{
    "name": "animals"
  }]
}
```

While running it with this object, it will succeed:

```json
{
  "tags": [{
    "name": "animals",
    "description": "come in all shapes and sizes"
  }]
}
```

### Extending Rules

Rulesets can extend other rulesets. For example, Spectral comes with two built in rulesets - one for OpenAPI v2 (`spectral:oas2`), and one for OpenAPI v3 (`spectral:oas3`). 

Use the `extends` property in your ruleset file to build upon or customize other rulesets.

```yaml
extends: spectral:oas2
rules:
  my-rule-name:
    description: Tags must have a description.
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

The example above will apply the core rules from the built in OpenAPI v2 ruleset AND apply the custom `my-rule-name` rule. 

Extends can be a single string or an array of strings, and can contain either local file paths or URLs. In the future we will support loading from NPM modules. 

### Enable Rules

Sometimes you might want to apply specific rules from another ruleset. Use the `extends` property, and pass `off` as the second argument in order to add the rules from another ruleset, but disable them all by default. This allows you to pick and choose which rules you would like to enable.

```yaml
extends: [[spectral:oas2, off]]
rules:
  # This rule is defined in the spectral:oas2 ruleset. We're passing `true` to turn it on and inherit the severity defined in the spectral:oas2 ruleset.
  operation-operationId-unique: true
```

The example above will run the single rule that we enabled, since we passed `off` to disable all rules by default when extending the `spectral:oas2` ruleset.

### Disable Rules

This example shows the opposite of the "Enabling Specific rules" example. Sometimes you might want to enable all rules by default, and disable a few.

```yaml
extends: [[spectral:oas2, all]]

rules:
  operation-operationId-unique: false
```

The example above will run all of the rules defined in the `spectral:oas2` ruleset (rather than the default behavior that runs just the recommended ones), with one exceptions - we turned `operation-operationId-unique` off.

The current recommended rules are marked with the property `recommended: true` in their respective rulesets:

- [Rules relevant to both OpenAPI v2 and v3](https://github.com/stoplightio/spectral/tree/develop/src/rulesets/oas/index.json)
- [Rules specific to only OpenAPI v2](https://github.com/stoplightio/spectral/tree/develop/src/rulesets/oas2/index.json)
- [Rules specific to only OpenAPI v3](https://github.com/stoplightio/spectral/tree/develop/src/rulesets/oas3/index.json)

### Changing Severity of a rule

```yaml
extends: spectral:oas2
rules:
  operation-2xx-response: warn
```

The example above will run the recommended rules from the `spectral:oas2` ruleset, but report `operation-2xx-response` as a warning rather than as an error (as is the default behavior in the `spectral:oas2` ruleset).

Available severity levels are `error`, `warn`, `info`, `hint`, and `off`.
