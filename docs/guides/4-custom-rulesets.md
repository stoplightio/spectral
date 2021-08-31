# Custom Rulesets

Customising the core rulesets will get you so far, but at some point you will want to create your very own rulesets. A ruleset is any set of rules that you want to apply to a JSON/YAML document, which could be OpenAPI, RAML, etc. Instead of just focusing on the quality of the OpenAPI/AsyncAPI documents you're writing like the core rulsets do, your custom rulesets could even implement an API Style Guide, but instead of being a Wiki document, it can be automated.

If you'd like to make sure your APIs are consistent and high quality before they've even built, create a ruleset with rules that define how URLs should work, what security schemes are appropriate, or what Hypermedia Formats should be used.

Or you can create a custom ruleset to make sure your Jekyll or Gatsby custom data is vaid. Whatever you want to do, to start with you'll need to create some rules.

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

It has a specific syntax known as [JSON Path](https://jsonpath.com/), which if you are familiar with XPath is quite similar. JSON Path is not yet a standard (it [will be](https://tools.ietf.org/html/draft-normington-jsonpath-00) someday), and has a few competing implementations. Spectral uses [jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus) for the implementation, which supports all the main JSON Path functionality and a little bit more, but this syntax may differ slightly from other JSON Path implementations.

Your `given` value can be a string containing any valid JSON Path Plus expression, or an array of expressions to apply a rule to multiple parts of a document.

Use the [JSON Path Online Evaluator](http://jsonpath.com/) to determine what `given` path you want.

### Severity

The `severity` keyword is optional and can be `error`, `warn`, `info`, or `hint`.

The default value is `warn`.

### Resolved

By default, Spectral processes each rule on a "resolved" document (a file where
all `$ref` JSON Schema references have been replaced with the objects they point
to). While this is typically the desired behavior, there are some use cases
where you may need to run a rule on the "raw" un-resolved document. For example,
if you want to enforce conventions on the folder structure used for [splitting
up documents](https://stoplight.io/blog/keeping-openapi-dry-and-portable/).

If your rule needs to access the raw `$ref` reference values, you can set
`resolved: false` to allow the rule to receive the raw un-resolved version of
the document. Otherwise `resolved: true` is the default.

Here's an eample of a rule that can access `$ref` values:

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

`then` has two required keywords:

```yaml
then:
  field: description
  function: truthy
```

The `field` keyword is optional, and is for applying the function to a specific property in an object. If omitted the function will be applied to the entire target of the `given` JSON Path. The value can also be `@key` to apply the rule to a keys of an object.

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

## Redefining Rules

When extending another ruleset, you can actually replace a rule it has declared by adding a new rule to your own ruleset with the same name.

```yaml
extends: spectral:oas
rules:
  tag-description:
    description: Please provide a description for each tag.
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

This provides a new description, and changes recommended to true, but anything can be changed.

If you're just looking change the severity of the rule, there is a handy shortcut.

## Changing Rule Severity

Maybe you want to use the rules from the `spectral:oas` ruleset, but instead of `operation-success-response` triggering an error you'd like it to trigger a warning instead.

```yaml
extends: spectral:oas
rules:
  operation-success-response: warn
```

Available severity levels are `error`, `warn`, `info`, `hint`, and `off`.

## Disabling Rules

This example shows the opposite of the "Enabling Specific Rules" example. Sometimes you might want to enable all rules by default, and disable a few.

```yaml
extends: [[spectral:oas, all]]
rules:
  operation-operationId-unique: off
```

The example above will run all of the rules defined in the `spectral:oas` ruleset (rather than the default behavior that runs only the recommended ones), with one exceptions - we turned `operation-operationId-unique` off.

<!-- theme: info -->

## Enabling Rules

Sometimes you might want to apply specific rules from another ruleset. Use the `extends` property, and pass `off` as the second argument in order to add the rules from another ruleset, but disable them all by default. This allows you to pick and choose which rules you would like to enable.

```yaml
extends: [[spectral:oas, off]]
rules:
  operation-operationId-unique: true
```

The example above will run the single rule that we enabled, since we passed `off` to disable all rules by default when extending the `spectral:oas` ruleset.

## Recommended or All

Rules by default are considered "recommended" (equivalent to a rule having) `recommended: true` but they can also be marked as not recommended with `recommended: false`. This can help scenarios like rolling out rulesets across API landscapes witha lot of legacy APIs which might have a hard time following every rule immediately. A two-tier system for rules can be helpful here, to avoid requiring several rulesets for this basic use-case.

You can try this out with the core OpenAPI ruleset. If you simply extend the ruleset, by default you will only get the recommended rules.

```yaml
extends: [[spectral:oas, recommended]]
```

Far more rule exist than just the recommended ones, there are various other rules which will help you create high quality OpenAPI descriptions.

```yaml
extends: [[spectral:oas, all]]
```

You can do this with your rulesets, and slide new rules in as not recommended for a while so that only the most interested active API designers/developers get them at first, then eventually roll them out to everyone if they are well received.

## Enriching Messages

To help you create meaningful error messages, Spectral comes with a couple of placeholders that are evaluated at runtime.

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

If you do not care about duplicate keys or invalid values (such as non-string mapping keys in YAML), you can tune their severity using `parserOptions` setting.

```yaml
extends: spectral:oas
parserOptions:
  duplicateKeys: warn # error is the default value
  incompatibleValues: off # error is the default value
```

`parserOptions` is not inherited by extended rulesets.

## Documentation URL

Optionally provide a documentation URL to your ruleset in order to help end-users find more information about various warnings. Result messages will sometimes be more than enough to explain what the problem is, but it can also be beneficial to explain _why_ a message exists, and this is a great place to do that.

Whatever you link you provide, the rule name will be appended as an anchor.

```yaml
extends: spectral:oas
documentationUrl: https://www.example.com/docs/api-ruleset.md
rules:
  tag-description:
    description: Please provide a description for each tag.
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

In this example, violations of the `tag-description` rule would indicate `https://www.example.com/docs/api-ruleset.md#tag-description` as the location for finding out more about the rule.

If no `documentationUrl` is provided, no links will show up, and users will just have to rely on the error messages to figure out how the errors can be fixed.

If you wish to override a documentation URL for a particular rule, you can do so by specifying `documentationUrl`.

```yaml
extends: spectral:oas
documentationUrl: https://www.example.com/docs/api-ruleset.md
rules:
  tag-description:
    description: Please provide a description for each tag.
    documentationUrl: https://www.example.com/docs/tag-description.md
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

## Core Functions

Several functions [are provided by default](../reference/functions.md) for your rules.

## Custom Functions

If none of the [core functions](../reference/functions.md) do what you want, you can [write your own custom functions](./5-custom-functions.md).

## Alternative JS Ruleset Format

Spectral now supports an alternative format to write rulesets in Javascript using a similar syntax.

### Benifits

- Explicitly load formats or rulesets to get control over versioning.
- Load common functions from popular JS libraries easily

**Example**

```js
//you can import popular functions from libraries
import { isObject } from "https://cdn.jsdelivr.net/npm/lodash-es/+esm";
import { truthy, schema } from "https://cdn.jsdelivr.net/npm/@stoplight/spectral-functions/+esm";
// you can stick to an older version if you want to for some reason. That's fine
import { alphabetical } from "https://cdn.jsdelivr.net/npm/@stoplight/spectral-functions@1.0.4/+esm";
import { oasRuleset } from "https://cdn.jsdelivr.net/npm/@stoplight/spectral-rulesets/+esm";
import { oas2 } from "https://cdn.jsdelivr.net/npm/@stoplight/spectral-formats/+esm";

import { verifyType } from "./verifyType.mjs";

const $SCHEMA_DRAFT_2020_XX_REGEX = /^https?:\/\/json-schema.org\/draft\/2020-\d\d\/(?:hyper-)?schema#?$/;

const JSONSchemaDraft2020_XX = document => isObject(document) && "$schema" in document && $SCHEMA_DRAFT_2020_XX_REGEX.test(document.$schema);

export default {
  formats: [oas2, oas3],
  // No longer accepts functions & functionOptions
  extends: [oasRuleset],
  rules: {
    "valid-rule": {
      given: "$.info",
      then: {
        function: truthy, // instead of 'truthy'
      },
    },
    "only-new-json-schema": {
      formats: [JSONSchemaDraft2020_XX],
      given: "$..type",
      then: {
        function: verifyType,
      },
    },
  },
};
```

## Aliases

Targeting certain parts of an OpenAPI spec is powerful but it can become cumbersome to write and repeat complex JSON path expressions across various rules. Define aliases for commonly used JSON paths on a global level which can then be reused across the ruleset.

Aliases can be defined in an array of key-value pairs at the root level of the ruleset.

```
aliases:{
  {Name}: '{JSONPath}'
}
```

**Example**

```json
{
  "aliases": {
    "HeaderNames": "$..parameters.[?(@.in === 'header')].name",
    "Info": "$..info",
    "InfoDescription": "#Info.description",
    "InfoContact": "#Info.contact",
    "Paths": "$.paths[*]~"
  }
}
```

Rulesets can then reference aliases in the [given](#given) keyword, either in full: `"given": "#Paths"`, or use it as a prefix for further JSON Path syntax, like dot notation: `"given": "#InfoContact.name"`.

> This will be followed by our core rulesets providing a common set of aliases for OpenAPI and AsyncAPI so that our users don't have to do the work at all. If you have ideas about what kind of aliases could be useful leave your thoughts [here](https://roadmap.stoplight.io).

## Overrides

Previously Spectral supported exceptions, which were limited in their ability to target particular rules on specific files or parts of files, or changing parts of a rule. Overrides is the much more powerful version of exceptions, with the ability to customize ruleset usage for different files and projects without having to duplicate any rules.

Overrides can be used to:

- Override rulesets to apply on particular files/folders `files: ['schemas/**/*.draft7.json']`
- Override rulesets to apply on particular JSON Path's `files: ['**#/components/schemas/Item']`
- Override rulesets to apply on particular formats `formats: [jsonSchemaDraft7]`
- Override particular rules

**Example**

```json
{
  "overrides": [
    {
      "files": ["schemas/**/*.draft7.json"],
      "formats": ["json-schema-draft7"],
      "rules": {
        "valid-number-validation": {
          "given": ["$..exclusiveMinimum", "$..exclusiveMaximum"],
          "then": {
            "function": "schema",
            "functionOptions": {
              "type": "number"
            }
          }
        }
      }
    }
  ]
}
```

One can also mix globs with actual paths, i.e.

```json
{
  "overrides": [
    {
      "files": ["legacy/**/*.oas.json#/paths"],
      "rules": {
        "some-inherited-rule": "off"
      }
    }
  ]
}
```

In the event of multiple matches, the order of definition takes place, with the last one having the higher priority.
