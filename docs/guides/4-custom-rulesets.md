# Rulesets

Spectral comes with two rulesets built-in: [OpenAPI](../reference/openapi-rules.md) and [AsyncAPI](../reference/asyncapi-rules.md). They're good starting points, but the true power of Spectral comes with customizing and creating a ruleset that fits your project or organization. Creating a ruleset can help you and your team improve your API design and API development process, and help you create better APIs.

Let's look through the keywords that make up a ruleset, so you can learn how to tweak a distributed ruleset to work for you, or make your own ruleset from scratch to power your organizations [API Style Guide](https://stoplight.io/api-style-guides-guidelines-and-best-practices/?utm_source=github&utm_medium=spectral&utm_campaign=docs).

## Ruleset Properties

There are five properties that can be used at the root level of a ruleset:

- `rules` (required): An array of rules. See [Rules](./4a-rules.md) for more details.
- `extends` (optional): A reference to other rulesets. Used to extend and customize existing rulesets. See [Extends](./4b-extends.md) for more details.
- `formats` (optional): The format that the ruleset should apply to. For example, `oas3` for any OpenAPI v3.x descriptions. Can be applied at the ruleset and/or rule level. See [Formats](#formats) for more details.
- `documentationUrl` (optional): A URL that contains more information about the ruleset and rules in it. Can help provide users more context on why the ruleset exists and how it should be used. See [Documentation URL](#documentation-url) for more details.
- `parserOptions` (optional): Can be used to tune the severity of duplicate keys or invalid values in your ruleset. See [Parsing Options](#parsing-options) for more details.
- `aliases` (optional): An array of key-value pairs that can be used to define commonly used JSONPath expressions to be reused across a ruleset. See [Aliases](./4c-aliases.md) for more details.
- `overrides` (optional): Can be used to customize which formats, files, or parts of files, that a ruleset should be applied to. See [Overrides](./4d-overrides.md) for more details.

Rules are the most important part of a ruleset. For more details on rules and its properties, see [Rules](./4a-rules.md).

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these formats:

- `aas2` (AsyncAPI v2.x)
- `aas2_0` (AsyncAPI v2.0.0)
- `aas2_1` (AsyncAPI v2.1.0)
- `aas2_2` (AsyncAPI v2.2.0)
- `aas2_3` (AsyncAPI v2.3.0)
- `aas2_4` (AsyncAPI v2.4.0)
- `aas2_5` (AsyncAPI v2.5.0)
- `aas2_6` (AsyncAPI v2.6.0)
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

Specifying the format is optional, so you can ignore this if all the rules you are writing apply to any document you lint, or if you have specific rulesets for different formats. If you'd like to use one ruleset for multiple formats, use the `formats` key.

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

Now all the rules in this ruleset are applied if the specified format is detected.

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

### Documentation URL

Optionally provide a documentation URL to your ruleset to help end-users find more information about warnings. Result messages are sometimes be more than enough to explain what the problem is, but it can also be beneficial to explain _why_ a message exists, and this is a great place to do that.

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

If no `documentationUrl` is provided, no links are displayed, and users have to rely on the error messages to figure out how the errors can be fixed.

If you wish to override a documentation URL of a particular rule, you can do so by specifying `documentationUrl`.

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

### Parsing Options

<!-- TODO: expand on this topic -->

If you don't care about duplicate keys or invalid values (such as non-string mapping keys in YAML), you can tune their severity using the `parserOptions` setting.

```yaml
extends: spectral:oas
parserOptions:
  duplicateKeys: warn # error is the default value
  incompatibleValues: off # error is the default value
```

`parserOptions` isn't inherited by extended rulesets.
