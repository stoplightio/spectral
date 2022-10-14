# Custom Rulesets

Customizing existing rulesets might be all you need at first, but at some point, you will want to make a custom ruleset. For example, the OpenAPI and AsyncAPI rulesets help create better quality descriptions of APIs, but you could create a custom ruleset to tell you how to make better APIs. This approach is how huge companies automate [API Style Guides](https://stoplight.io/api-style-guides-guidelines-and-best-practices/?utm_source=github&utm_medium=spectral&utm_campaign=docs), instead of writing up giant Wiki documents that nobody reads.

If you'd like to make sure your APIs are consistent and high quality even before they're built, create a ruleset with rules that define how URLs should work, what security schemes are appropriate, or what error formats should be used. Read our article _[Six Things You Should Include in Your API Style Guide](https://blog.stoplight.io/six-things-you-should-include-in-your-api-style-guide?utm_source=github&utm_medium=spectral&utm_campaign=docs)._

Or you can create a custom ruleset to make sure your Jekyll or Gatsby custom data is valid. Whatever you want to do, to start with you'll need to create some rules.

## Ruleset Properties

There are three properties that can be used at the root level of a ruleset:

- `rules` (required): An array of rules.
- `formats` (optional): The format that the ruleset should apply to. For example `oas3` for any OpenAPI v3.x descriptions.
- `extends` (optional): A reference to other rulesets. Used to extend and customize existing rulesets.
- `documentationUrl` (optional): A URL that contains more information about the ruleset and rules in it. Can help provide users more context on why the ruleset exists and how it should be used.

## Adding Rules

Add your own rules under the `rules` property in your `.spectral.yml`, or another ruleset file.

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

### Given

The `given` property is conceptually quite like a selector in CSS, in that it picks the part of the document to apply rules to.

It has a specific syntax known as [JSONPath](https://goessner.net/articles/JsonPath/index.html), which if you are familiar with XPath is quite similar. JSONPath is not yet a standard (it [will be](https://tools.ietf.org/html/draft-normington-jsonpath-00) someday), and has a few competing implementations. Spectral uses [nimma](https://www.npmjs.com/package/nimma) as its main implementation, and sometimes resorts to [jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus) to ensure a good backwards-compatibility.
Both of them support all the main JSONPath functionality and a little bit more, but this syntax may differ slightly from other JSONPath implementations.

Your `given` value can be a string containing any valid JSONPath expression, or an array of expressions to apply a rule to multiple parts of a document.
You can also consume your [aliases](4c-aliases.md) here if you have some defined.

Use the [JSONPath Online Evaluator](http://jsonpath.com/) to determine what `given` path you want.

### Severity

The `severity` keyword is optional and can be `error`, `warn`, `info`, or `hint`.

The default value is `warn`.

### Resolved

By default, Spectral processes each rule on a "resolved" document (a file where
all `$ref` JSON Schema references have been replaced with the objects they point
to). While this is typically the desired behavior, there are some use cases
where you may need to run a rule on the "raw" un-resolved document.

For example, if you want to enforce conventions on the folder structure used for
[splitting up
documents](https://blog.stoplight.io/keeping-openapi-dry-and-portable?utm_medium=spectral&utm_source=github&utm_campaign=docs).

If your rule needs to access the raw `$ref` reference values, you can set `resolved: false` to allow the rule to receive the raw un-resolved version of the document. Otherwise `resolved: true` is the default.

Here's an example of a rule that can access `$ref` values:

```yaml
rules:
  my-rule-name:
    description: Parameters must be references
    given: $.paths.[*][get,post,put,delete,options]
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

### Then

The `then` part of the rule explains which function to apply to the `given` JSONPath. The function you apply [may be one of the core functions](../reference/functions.md) or it may be [a custom function](./5-custom-functions.md).

`then` has two main keywords:

```yaml
then:
  field: description
  function: truthy
```

The `field` keyword is optional and is used to apply the function to a specific property in an object. If omitted the function will be applied to the entire target of the `given` JSONPath. The value can also be `@key` to apply the rule to the keys of an object.

```yaml
given: "$.responses"
then:
  field: "@key"
  function: pattern
  functionOptions:
    match: "^[0-9]+$"
```

The above [`pattern` based rule](../reference/functions.md#pattern) would error on `456avbas` as it is not numeric.

```yaml
responses:
  123:
    foo: bar
  456avbas:
    foo: bar
```

You can also have multiple `then`s to target different properties in the same object, or to use different functions. For example, you can have one rule that will check if an object has multiple properties:

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

To help you create meaningful messages for results, Spectral comes with a couple of placeholders that are evaluated at runtime.

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

## Parsing Options

<!-- TODO: expand on this topic -->

If you do not care about duplicate keys or invalid values (such as non-string mapping keys in YAML), you can tune their severity using the `parserOptions` setting.

```yaml
extends: spectral:oas
parserOptions:
  duplicateKeys: warn # error is the default value
  incompatibleValues: off # error is the default value
```

`parserOptions` is not inherited by extended rulesets.

## Documentation URL

Optionally provide a documentation URL to your ruleset in order to help end-users find more information about various warnings. Result messages will sometimes be more than enough to explain what the problem is, but it can also be beneficial to explain _why_ a message exists, and this is a great place to do that.

The rule name is appended to the link as an anchor.

```yaml
# 👇 This line allows people to find more information
documentationUrl: https://www.example.com/docs/api-style-guide.md
rules:
  no-http-basic:
    description: "Consider a more secure alternative to HTTP Basic."
    message: "HTTP Basic is a pretty insecure way to pass credentials around, please consider an alternative."
    severity: error
    given: $.components.securitySchemes[*]
    then:
      field: scheme
      function: pattern
      functionOptions:
        notMatch: basic
```

In this example, violations of the `no-http-basic` rule would indicate `https://www.example.com/docs/api-style-guide.md#no-http-basic` as the location for finding out more about the rule.

If no `documentationUrl` is provided, no links will show up, and users will just have to rely on the error messages to figure out how the errors can be fixed.

If you wish to override a documentation URL for a particular rule, you can do so by specifying `documentationUrl`.

```yaml
extends: spectral:oas
rules:
  tag-description:
    description: Please provide a description for each tag.
    documentationUrl: https://www.example.com/docs/tag-description.md
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

## Formats

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
