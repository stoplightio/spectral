# Core Functions

Rules use "functions" and those can be custom defined. To save everyone the effort of writing functions for common tasks, Spectral comes with a few bundled out of the box. 

## alphabetical

Enforce alphabetical content, for simple arrays, or for objects by passing a key.

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
keyedBy | key to sort an object by | no

<!-- title: example -->

```yaml
openapi-tags-alphabetical:
  description: OpenAPI object should have alphabetical `tags`.
  type: style
  recommended: true
  given: "$"
  then:
    field: tags
    function: alphabetical
    functionOptions:
      keyedBy: name
```

## enumeration

Does the field value exist in this set of possible values?

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
values | an array of possible values | yes

<!-- title: example -->

```yaml
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

<!-- title: example -->

```yaml
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

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
match | if provided, value must match this regex | no
notMatch | if provided, value must _not_ match this regex | no

<!-- title: example -->

```yaml
  path-no-trailing-slash:
    description: Paths should not end with `#/`.
    type: style
    given: "$.paths[*]~"
    then:
      function: pattern
      functionOptions:
        notMatch: ".+\/$"
```

## casing

Text must match a certain case, like `camelCase` or `snake_case`. 

<!-- title: functionOptions -->

name                   | description                                             | required?
-----------------------|---------------------------------------------------------|----------
type                   | the casing type to match against                        | yes
disallowDigits         | if not truthy, digits are allowed                       | no
separator.char         | additional char to separate groups of words             | no
separator.allowLeading | can the group separator char be used at the first char? | no

**Note:** In advanced scenarios, `separator.char` and `separator.allowLeading` can be leveraged to validate certain naming conventions.
For instance, the following naming style could be enforced:
 - Headers _(eg. `X-YourMighty-Header`)_: type: `pascal`, separator.char: `-`
 - Camel cased paths _(eg. `/path/toThe/amazingResource`)_: type: `camel`, separator.char: `/`, separator.allowLeading: `true`

Available types are: 

| name   | sample         |
|--------|----------------|
| flat   | verylongname   |
| camel  | veryLongName   |
| pascal | VeryLongName   |
| kebab  | very-long-name |
| cobol  | VERY-LONG-NAME |
| snake  | very_long_name |
| macro  | VERY_LONG_NAME |

<!-- title: example -->

```yaml
camel-case-name:
  description: Name should camelCased.
  type: style
  given: "$.name"
  then:
    function: casing
    functionOptions:
      type: camel
```

## schema

Use JSON Schema (draft 4, 6 or 7) to treat the contents of the $given JSON Path as a JSON instance.

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
schema | a valid JSON Schema document | yes

<!-- title: example -->

```yaml
oas3-api-servers:
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

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
field | the field to check | yes
schemaPath | a json path pointing to the json schema to use | yes

<!-- title: example -->

``` yaml
  valid-oas-example-in-parameters:
    description: Examples must be valid against their defined schema.
    message: "{{error}}"
    recommended: true
    severity: 0
    type: validation
    given: "$..parameters..[?(@.example && @.schema)]"
    then:
      function: schemaPath
      functionOptions:
        field: example
        schemaPath: "$.schema"
```

## truthy

The value should not be `false`, `""`, `0`, `null` or `undefined`. Basically anything that would not trigger this: `if (targetVal)`.

## undefined

The value must be `undefined`. When combined with `field: foo` on an object the `foo` property must be undefined.

_**Note:** Due to the way YAML works, just having `foo: ` with no value set is not the same as being `undefined`. This would be `falsy`._

## unreferencedReusableObject

This function identifies unreferenced objects within a document.

For it to properly operate, `given` should point to the member holding the potential reusable objects.

_Warning:_ This function may identify false positives when used against a specification that acts as a library (a container storing reusable objects, leveraged by other specifications that reference those objects).

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
reusableObjectsLocation | a local json pointer to the document member holding the reusable objects (eg. `#/definitions` for an OAS2 document, `#/components/schemas` for an OAS3 document). | yes

<!-- title: example -->

``` yaml
unused-definition:
  description: Potentially unused definition has been detected.
  recommended: true
  type: style
  resolved: false
  given: "$.definitions"
  then:
    function: unreferencedReusableObject
    functionOptions:
      reusableObjectsLocation: "#/definitions"
```

## xor

Communicate that only one of these properties is allowed, and no more than one of them.

<!-- title: functionOptions -->

name | description | required?
---------|----------|---------
properties | the properties to check | yes

<!-- title: example -->

```yaml
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

## typedEnum

When both a `type` and `enum` are defined for a property, the enum values must respect the type.
