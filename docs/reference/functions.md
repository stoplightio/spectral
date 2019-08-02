# Core Functions

Rules use "functions" and those can be custom defined. To save everyone the effort of writing functions for common tasks, Spectral comes with a few bundled out of the box. 

All functions 

## alphabetical

Enforce alphabetical content, for simple arrays, or for objects by passing a key.

*functionOptions*

- keyedBy: optional key to sort an object by

``` yaml
  openapi-tags-alphabetical:
    description: OpenAPI object should have alphabetical `tags`.
    type: style
    given: "$"
    then:
      field: tags
      function: alphabetical
      functionOptions:
        keyedBy: name
```

## enumeration

Does the field value exist in this set of possible values?

*functionOptions*

- values: an array of possible values

``` yaml
  whitelisted-tags:
    description: Pick from a very restrictive set of tags.
    type: style
    given: "$.paths.*"
    then:
      field: tags
      function: enumeration
      functionOptions:
        values:
          - users
          - articles
          - categories
```

## falsy

The value should be `false`, `""`, `0`, `null` or `undefined`. Basically anything that would not trigger this: `if (!!targetVal)`. 

## length

Count the length of a string an or array, the number of properties in an object, or a numeric value, and define minimum and/or maximum values.

``` yaml
  operation-singular-tag:
    description: Operations must have between 1 and 3 tags.
    type: style
    given: "$.paths.*"
    then:
      field: tags
      function: length
      functionOptions:
        max: 3
        min: 1
```

## pattern

Regular expressions! 

*functionOptions*

- match: if provided, value must match this regex
- notMatch: if provided, value must _not_ match this regex

``` yaml
  path-no-trailing-slash:
    description: Paths should not end with `#/`.
    type: style
    given: "$.paths[*]~"
    then:
      function: pattern
      functionOptions:
        notMatch: ".+\/$"
```

## schema

Use JSON Schema (draft 7) to treat the contents of the $given JSON Path as a JSON instance.

*functionOptions*

- schema: a valid JSON Schema document

``` yaml
  api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    recommended: true
    type: "style"
    given: "$"
    then:
      field: servers
      function: schema
      functionOptions:
        schema:
          type: array
          items:
            type: object
          minItems: 1
```

## schemaPath

The schema-path rule is very meta. It is an extension of the schema rule, but it looks for a schema which exists inside the description document. This may never be useful for anything other than the use-case of checking OpenAPI examples are valid:

``` yaml
  valid-example:
    description: Examples must be valid against their defined schema.
    message: "\"{{property}}\" property {{error}}"
    recommended: true
    type: validation
    given: "$..[?(@.example)]"
    then:
      function: schemaPath
      functionOptions:
        field: example
        schemaPath: "$"
```

## truthy

The value should not be `false`, `""`, `0`, `null` or `undefined`. Basically anything that would not trigger this: `if (targetVal)`.

## undefined

The value must not be `undefined`, which in YAML/JSON terms means the property should not exist.

## xor

Communicate that only one of these properties is allowed, and no more than one of them.

``` yaml
  example-value-or-externalValue:
    description: Example should have either a `value` or `externalValue` field.
    type: style
    given: "$..example"
    then:
      function: xor
      functionOptions:
        properties:
        - externalValue
        - value
```
