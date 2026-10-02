## Overrides

Previously Spectral supported exceptions, which were limited in their ability to target particular rules on specific files or parts of files or change parts of a rule. Overrides are the much more powerful version of exceptions, with the ability to customize ruleset usage for different files and projects without having to duplicate any rules.

Overrides can be used to apply rulesets on:

- Particular formats `formats: [jsonSchemaDraft7]`
- Particular files/folders `files: ['schemas/**/*.draft7.json']`
- Particular elements of files `files: ['**#/components/schemas/Item']`
- Override particular rules

An override must state `files`, `formats`, or both. When it states both, it applies only to documents that match both. Documents whose format cannot be detected are never matched by an override that states `formats`.

**Example**

```yaml
overrides:
  - formats:
      - json-schema-draft7
    files:
      - schemas/**/*.draft7.json
    rules:
      valid-number-validation:
        given:
          - $..exclusiveMinimum
          - $..exclusiveMaximum
        then:
          function: schema
          functionOptions:
            schema:
              type: number
```

To change a rule for every document of a given format, regardless of where the document lives, leave `files` out:

```yaml
extends: [spectral:oas, spectral:asyncapi]
overrides:
  - formats:
      - oas3_0
    rules:
      operation-description: info
```

Here `operation-description` is reported as `info` for OpenAPI 3.0 documents, and keeps its usual severity for every other document linted with the same ruleset.

To apply an override to particular elements of files, combine a glob for a filepath with a [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) after the anchor, i.e.:

```yaml
overrides:
  - files:
      - "legacy/**/*.oas.json#/paths"
    rules:
      some-inherited-rule: "off"
```

Overrides that use JSON Pointers can state `formats` too, and as before they can contain nothing but `rules` with severities.

JSON Pointers have a different syntax than JSON Paths used in the `given` component of a rule.

In JSON Pointers, path components are prefixed with a `/` and then concatenated to form the pointer.

Since `/` has a special meaning in JSON pointer, it must be encoded as `~1` when it appears in a component, and `~` must be encoded as `~0`.
JSON Pointer must be percent-encoded for use within a URI as specified by the [spec](https://datatracker.ietf.org/doc/html/rfc6901#section-6)

You can test JSON Pointer expressions in the [JSON Query online evaluator](https://www.jsonquerytool.com/) by choosing "JSONPointer" as the Transform.
Bear in mind the tool above expects plain JSON Pointer, thus you need to decode any previously percent-encoded characters.

```yaml
overrides:
  - files:
      - "legacy/**/*.oas.json#/paths/~1Pets~1%7BpetId%7D/get/parameters/0"
    rules:
      some-inherited-rule: "off"
```

In the event of multiple matches, the order of definition takes place, with the last one having the higher priority.

### Caveats

#### External Dependencies ($refs)

Overrides are only applied to the _root_ documents. If your documents have any external dependencies ($refs), the overrides won't apply.

Example:

Given the following 2 YAML documents:

```yaml
# my-document.yaml
openapi: "3.1.0"
paths: {}
components:
  schemas:
    User:
      $ref: "./User.yaml"
```

```yaml
# User.yaml
title: ""
type: object
properties:
  id:
    type: string
required:
  - id
```

And the ruleset below:

```json
{
  "rules": {
    "empty-title-property": {
      "message": "Title must not be empty",
      "given": "$..title",
      "then": {
        "function": "truthy"
      }
    }
  },
  "overrides": [
    {
      "files": ["User.yaml"],
      "rules": {
        "empty-title-property": "off"
      }
    }
  ]
}
```

Running `spectral lint my-document.yaml` results in the following output:

```
/project/User.yaml
 1:8  warning  empty-title-property  Title must not be empty  title

✖ 1 problem (0 errors, 1 warning, 0 infos, 0 hints)
```

While executing `spectral lint User.yaml` outputs:

```
No results with a severity of 'error' or higher found!
```

#### Extended Rulesets (extends)

Overrides aren't supported in other files through [extended rulesets (`extends`)](4b-extends.md). For example, if you create a ruleset file (`rulesetA`) that includes another file (`rulesetB`) through `extends`, overrides are ignored if you apply them to `rulesetB`.

However, you can use JS rulesets to inherit overrides. This example shows how to apply an override in `rulesetB`:

```JavaScript
import rulesetA from './ruleset';

export default {
  extends: rulesetA,
  overrides: rulesetA.overrides,
};
```
