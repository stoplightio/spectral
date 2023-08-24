# Rules

Rules are at the core of how rulesets work, so let's look at how to create a rule and its properties.

## Rules Properties

Rules can be added under the `rules` property in your ruleset file.

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

The example above is a valid ruleset with a single rule that can be used to lint an OpenAPI description, and validate that all `tags` have a description field.

Rules can have the following properties:

- `given` (required): The part of the document the rule should be applied to. Uses the [JSONPath](https://goessner.net/articles/JsonPath/index.html) syntax.
- `then` (required): Describes which function should be applied to the `given` part of the document. Can be used with a [core function](../reference/functions.md) or [custom function](./5-custom-functions.md).
- `description` (optional): A short description of the rule.
- `message` (optional): A message that's displayed in the `spectral lint` output. Can be customized to use placeholder values that are evaluated at runtime, such as `{{description}}` or `{{error}}`.
- `severity` (optional): The severity of the rule. Used to differentiate between rules that must be followed (`error`) and warnings or hints. Default value is `warn`.
- `formats` (optional): The format that the rule should apply to. For example `oas3` for any OpenAPI v3.x descriptions. Can be applied at the ruleset and/or rule level. See [Formats](./4-custom-rulesets.md#formats) for more details.
- `recommended` (optional): Use `recommended` when extending a ruleset so users can enforce all rules (`recommended` set to `false`) or only recommended rules (`recommended` set to `true`). Recommended can be used to slowly roll out a ruleset across API landscapes with a lot of legacy APIs. Default value is `true`. See [Recommended](./4e-recommended.md) for more details.
- `resolved` (optional): Used to apply a rule to a document that's not "resolved," where `$ref` JSON Schema references haven't been replaced with the objects they point to.

Let's look at all the properties that can be used for a rule.

### Given

The `given` property is conceptually similar to a selector in CSS, in that it indicates the part of the document to apply rules to.

`given` has a specific syntax known as [JSONPath](https://goessner.net/articles/JsonPath/index.html), which is similar to XPath. JSONPath isn't yet a standard (it [should be](https://tools.ietf.org/html/draft-normington-jsonpath-00) someday), and has a few competing implementations. Spectral uses [nimma](https://www.npmjs.com/package/nimma) as its main implementation, and sometimes resorts to [jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus) to ensure backwards-compatibility. Both support all the main JSONPath functionality and a bit more, but this syntax may differ slightly from other JSONPath implementations.

Your `given` value can be a string containing any valid JSONPath expression, or an array of expressions to apply a rule to multiple parts of a document.
You can also consume your [aliases](4c-aliases.md) here if you have some defined.

Use the [JSONPath Online Evaluator](http://jsonpath.com/) to determine what `given` path you want.

### Then

The `then` part of the rule explains which function to apply to the `given` JSONPath. The function you apply [may be one of the core functions](../reference/functions.md) or it may be [a custom function](./5-custom-functions.md).

`then` has two main keywords:

```yaml
then:
  field: description
  function: truthy
```

The `field` keyword is optional and is used to apply the function to a specific property in an object. If omitted, the function is applied to the entire target of the `given` JSONPath. The value can also be `@key` to apply the rule to the keys of an object.

```yaml
given: "$.responses"
then:
  field: "@key"
  function: pattern
  functionOptions:
    match: "^[0-9]+$"
```

The above [`pattern` based rule](../reference/functions.md#pattern) would error on `456avbas` as it's not numeric.

```yaml
responses:
  123:
    foo: bar
  456avbas:
    foo: bar
```

You can also have multiple `then`s to target different properties in the same object, or to use different functions. For example, you can have one rule that checks if an object has multiple properties:

```yaml
contact-properties:
  description: Contact object must have "name", "url", and "email".
  given: $.info.contact
  severity: warn
  then:
    - field: name
      function: truthy
    - field: url
      function: truthy
    - field: email
      function: truthy
```

### Message

To help you create meaningful messages for results, Spectral comes with placeholders that are evaluated at runtime.

- `{{error}}` - the error returned by function
- `{{description}}` - the description set on the rule
- `{{path}}` - the whole error path
- `{{property}}` - the last segment of error path
- `{{value}}` - the linted value

```yaml
message: "{{error}}" # will output the message generated by then.function
```

```yaml
message: "The value of '{{property}}' property must equal 'foo'"
```

```yaml
message: "{{value}} is greater than 0"
```

```yaml
message: "{{path}} cannot point at remote reference"
```

### Severity

The `severity` keyword is optional and can be `error`, `warn`, `info`, `hint`, or `off`.

The default value is `warn`.

### Resolved

By default, Spectral processes each rule on a "resolved" document (a file where all `$ref` JSON Schema references have been replaced with the objects they point to). While this is typically the desired behavior, there are some use cases where you may need to run a rule on the "raw" un-resolved document (for example, to enforce conventions on the folder structure used for [splitting up documents](https://blog.stoplight.io/keeping-openapi-dry-and-portable?utm_medium=spectral&utm_source=github&utm_campaign=docs)).

If your rule needs to access the raw `$ref` reference values, you can set `resolved: false` to allow the rule to receive the raw un-resolved version of the document. Otherwise `resolved: true` is the default.

Here's an example of a rule that can access `$ref` values:

```yaml
rules:
  my-rule-name:
    description: Parameters must be references
    given: $.paths[*][get,post,put,delete,options]
    severity: error
    resolved: false
    then:
      field: parameters
      function: schema
      functionOptions:
        schema:
          type: array
          items:
            type: object
            properties:
              $ref:
                type: string
            required:
              - $ref
```

**In most cases, you will want to operate on a resolved document.**
