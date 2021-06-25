# Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these formats:

- `asyncapi2` (AsyncAPI v2.0)
- `oas2` (OpenAPI v2.0)
- `oas3` (OpenAPI v3.x)
- `oas3.0` (OpenAPI v3.0.x)
- `oas3.1` (OpenAPI v3.1.x)
- `json-schema` (`$schema` says this is some JSON Schema draft)
- `json-schema-loose` (looks like JSON Schema, but no `$schema` found)
- `json-schema-draft4` (`$schema` says this is JSON Schema Draft 04)
- `json-schema-draft6` (`$schema` says this is JSON Schema Draft 06)
- `json-schema-draft7` (`$schema` says this is JSON Schema Draft 07)
- `json-schema-2019-09` (`$schema` says this is JSON Schema 2019-09)
- `json-schema-2020-12` (`$schema` says this is JSON Schema 2020-12)

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
