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

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these two formats:

- `oas2` (this is OpenAPI v2.0 - formerly known as Swagger)
- `oas3` (this is OpenAPI v3.0)

Specifying the format is optional, so you can completely ignore this if all the rules you are writing apply to any document you lint, or if you have specific rulesets for different formats. If you'd like to use one ruleset for multiple formats, the formats key is here to help.

```yaml
rules:
  api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    recommended: true
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

Seeing as the `servers` array only appeared in OpenAPI v3.0, we don't want this rule appearing when Spectral lints OpenAPI v2.0 documents.

Alternatively, formats can be specified at the ruleset level:

```yaml
formats: ["oas3"]
rules:
  api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    recommended: true
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

Now all the rules in this ruleset will only be applied if the specified format is detected.

Custom formats can be registered via the [JS API](../guides/javascript.md), but the CLI is limited to using the predefined ones.

### Severity

The `severity` keyword is optional and can be `error`, `warn`, `info`, or `hint`.

### Then

The Then part of the rules explains what to do with the `given` JSON Path, and involves two required keywords:

```yaml
  then:
    field: description
    function: truthy
```

The `field` keyword is optional, and is for applying the function to a specific property in an object. If omitted the function will be applied to the entire target of the `given` JSON Path. The value can also be `@key` to apply the rule to a keys of an object.

```yaml
given: '$.responses'
then:
  field: '@key'
  function: pattern
  functionOptions:
    match: '^[0-9]+$' 
```

The above pattern based rule would error on `456avbas` as it is not numeric.

```yaml
responses:
  123:
    foo: bar
  456avbas:
    foo: bar
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

Extends can be a single string or an array of strings, and can contain either local file paths or URLs.

```yaml
extends: 
- ./config/spectral.json
- https://example.org/api/style.yaml
```

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

The example above will run all of the rules defined in the `spectral:oas2` ruleset (rather than the default behavior that runs only the recommended ones), with one exceptions - we turned `operation-operationId-unique` off.

The current recommended rules are marked with the property `recommended: true` in their respective rulesets:

- [Rules relevant to both OpenAPI v2 and v3](https://github.com/stoplightio/spectral/tree/master/src/rulesets/oas/index.json)
- [Rules specific to only OpenAPI v2](https://github.com/stoplightio/spectral/tree/master/src/rulesets/oas2/index.json)
- [Rules specific to only OpenAPI v3](https://github.com/stoplightio/spectral/tree/master/src/rulesets/oas3/index.json)

### Changing Severity of a Rule

```yaml
extends: spectral:oas2
rules:
  operation-2xx-response: warn
```

The example above will run the recommended rules from the `spectral:oas2` ruleset, but report `operation-2xx-response` as a warning rather than as an error (as is the default behavior in the `spectral:oas2` ruleset).

Available severity levels are `error`, `warn`, `info`, `hint`, and `off`.


### Adding a custom function

Learn more about [custom functions](../reference/custom-functions.md). 
