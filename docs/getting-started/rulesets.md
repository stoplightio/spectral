# Rulesets

Rulesets are collections of rules, in a YAML or JSON file. These rules are taking parameters, and calling functions on certain parts of another YAML or JSON object being linted. 

## Adding a rule

Add your own rules under the `rules` property in your `.spectral.yml` ruleset file.

```yaml
rules:
  my-rule-name:
    description: Tags must have a description.
    given: $.tags[*]
    severity: error
    recommended: true
    then:
      field: description
      function: truthy
```

Spectral has a built-in set of functions such as `truthy` or `pattern`, which you can reference in your rules. Rules then target certain chunks of the JSON/YAML with the `given` keyword, which is a [JSONPath](http://jsonpath.com/) (actually, we use [JSONPath Plus](https://www.npmjs.com/package/jsonpath-plus)).

The example above adds a single rule that looks at the root level "tags" objects children to make sure they all have a description property.

<!-- theme: info -->
> Since v5.0, each rule is recommended by default. Prior to that the default was to be not recommended. It is best to be explicit and set `recommended: true` or `recommended: false` if a ruleset is likely to be used across multiple versions.

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

By default, Spectral processes each rule on resolved document with all $refs resolved.
If you would like to have an original input supplied to your rule, you can place `resolved` property as follows:

```yaml
rules:
  my-rule-name:
    description: Tags must have a description.
    given: $.tags[*]
    severity: error
    resolved: false # note - if not specified or true, a resolved document will be given
    then:
      field: description
      function: truthy
```

In most cases, you will want to operate on resolved document and therefore won't specify that property.
You might find `resolved` useful if your rule requires access to $refs.

## Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these formats:

- `oas2` (this is OpenAPI v2.0 - formerly known as Swagger)
- `oas3` (this is OpenAPI v3.0)
- `json-schema` (this is JSON Schema, detection based on the value of $schema property)
- `json-schema-loose` (this is JSON Schema, loose check, no $schema required)
- `json-schema-draft4` (this is JSON Schema Draft 4, detection based on the value of $schema property)
- `json-schema-draft6` (this is JSON Schema Draft 6, detection based on the value of $schema property)
- `json-schema-draft7` (this is JSON Schema Draft 7, detection based on the value of $schema property)
- `json-schema-2019-09` (this is JSON Schema 2019-09, detection based on the value of $schema property)
  
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

Seeing as the `servers` array only appeared in OpenAPI v3.0, we don't want this rule appearing when Spectral lints OpenAPI v2.0 documents.

Alternatively, formats can be specified at the ruleset level:

```yaml
formats: ["oas3"]
rules:
  oas3-api-servers:
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

## Given

The `given` keyword is, besides `then`, the only required property on each rule definition. 
It can be any valid JSONPath expression or an array of JSONPath expressions.
[JSONPath Online Evaluator](http://jsonpath.com/) is a helpful tool to determine what `given` path you want.

## Severity

The `severity` keyword is optional and can be `error`, `warn`, `info`, or `hint`. The default value is `warn`.

## Then

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

## Extending rules

Rulesets can extend other rulesets using the `extends` property. This can be used to build upon or customize other rulesets.

```yaml
extends: spectral:oas
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

## Enabling rules

Sometimes you might want to apply specific rules from another ruleset. Use the `extends` property, and pass `off` as the second argument in order to add the rules from another ruleset, but disable them all by default. This allows you to pick and choose which rules you would like to enable.

```yaml
extends: [[spectral:oas, off]]
rules:
  # This rule is defined in the spectral:oas ruleset. We're passing `true` to turn it on and inherit the severity defined in the spectral:oas ruleset.
  operation-operationId-unique: true
```

The example above will run the single rule that we enabled, since we passed `off` to disable all rules by default when extending the `spectral:oas` ruleset.

## Disabling rules

This example shows the opposite of the "Enabling Specific rules" example. Sometimes you might want to enable all rules by default, and disable a few.

```yaml
extends: [[spectral:oas, all]]
rules:
  operation-operationId-unique: false
```

The example above will run all of the rules defined in the `spectral:oas` ruleset (rather than the default behavior that runs only the recommended ones), with one exceptions - we turned `operation-operationId-unique` off.

- [Rules relevant to OpenAPI v2 and v3](../reference/openapi-rules.md)


## Changing rule severity

```yaml
extends: spectral:oas
rules:
  operation-2xx-response: warn
```

The example above will run the recommended rules from the `spectral:oas` ruleset, but report `operation-2xx-response` as a warning rather than as an error (as is the default behavior in the `spectral:oas` ruleset).

Available severity levels are `error`, `warn`, `info`, `hint`, and `off`.

## Enriching rule messages

To help you create meaningful error messages, Spectral comes with a couple of placeholders that are evaluated at runtime.

- {{error}} - the error returned by function
- {{description}} - the description set on the rule
- {{path}} - the whole error path
- {{property}} - the last segment of error path
- {{value}} - the linted value

### Examples

```yaml
message: "{{error}}" # will output the message generated by then.function 

message: "The value of '{{property}}' property must equal 'foo'"

message: "{{value}} is greater than 0"

message: "{{path}} cannot point at remote reference"
```
## Creating custom functions

Learn more about [custom functions](../guides/custom-functions.md).
