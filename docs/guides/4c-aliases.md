## Aliases

Targeting certain parts of an OpenAPI spec is powerful but it can become cumbersome to write and repeat complex JSONPath expressions across various rules.
Define aliases for commonly used JSONPath expressions on a global level which can then be reused across the ruleset.

Aliases can be defined in an array of key-value pairs at the root level of the ruleset, or alternatively, within an override.

It's similar to `given`, with the notable difference being the possibility to distinguish between different formats.

**Example**

```yaml
aliases:
  HeaderNames:
    - "$..parameters.[?(@.in === 'header')].name"
  Info:
    - "$..info"
  InfoDescription:
    - "#Info.description"
  InfoContact:
    - "#Info.contact"
  Paths:
    - "$.paths[*]~"
```

If you deal with a variety of different specs, you may find the above approach insufficient, particularly when the shape of the document is notably different.
In such a case, you may want to consider using scoped aliases.

```yaml
aliases:
  SharedParameterObject:
    description: an optional property describing the purpose of the alias
    targets:
      - formats:
          - oas2
        given:
          - $.parameters[*]
      - formats:
          - oas3
        given:
          - $.components.parameters[*]
```

Now, if you referenced the `SharedParameterObject` alias, the chosen path would be determined based on the document you use.

For instance, if a given document matched OpenAPI 2.x, `$.parameters[*]` would be used as the JSONPath expression.

Having a closer look at the example above, one may notice that it'd be still somewhat complicated to target _all_ Parameter Objects that a specific OpenAPI document may contain. To make it more feasible and avoid overly complex JSONPath expressions, `given` can be an array.

```yaml
aliases:
  PathItemObject:
    - $.paths[*]
  OperationObject:
    - "#PathItem[get,put,post,delete,options,head,patch,trace]"
  ParameterObject:
    description: an optional property describing the purpose of the alias
    targets:
      - formats:
          - oas2
        given:
          - "#PathItemObject.parameters[*]"
          - "#OperationObject.parameters[*]"
          - $.parameters[*]
      - formats:
          - oas3
        given:
          - "#PathItemObject.parameters[*]"
          - "#OperationObject.parameters[*]"
          - $.components.parameters[*]
```

Rulesets can then reference aliases in the [given](./4a-rules.md#given) keyword, either in full: `"given": "#Paths"`, or use it as a prefix for further JSONPath syntax, like dot notation: `"given": "#ParameterObject.name"`.

Keep in mind that an alias has to be explicitly defined either at the root level or inside an override. This is to avoid ambiguity.

```yaml
aliases:
  Stoplight:
    - "$..stoplight"
overrides:
  - files:
      - "*.yaml"
    rules:
      value-matches-stoplight:
        message: Value must contain Stoplight
        given: "#Stoplight" # valid because declared at the root
        severity: error
        then:
          field: description
          function: pattern
          functionOptions:
            match: Stoplight
  - files:
      - "**/*.json"
    aliases:
      Value:
        - "$..value"
    rules:
      truthy-stoplight-property:
        message: Value must contain Stoplight
        given: "#Value" # valid because declared within the override block
        severity: error
        then:
          function: truthy
  - files:
      - legacy/**/*.json
    rules:
      falsy-value:
        given: "#Value" # invalid because undeclared both at the top-level and the override. Note that this could be technically resolvable for some JSON documents because the previous override block has the alias, but to spare some headaches, we demand an alias to be explicitly defined.
        severity: error
        then:
          function: falsy
```

> This will be followed by our core rulesets providing a common set of aliases for OpenAPI and AsyncAPI so that our users don't have to do the work at all. If you have ideas about what kind of aliases could be useful leave your thoughts [here](https://roadmap.stoplight.io).
