# Spectral Rulesets

Rulesets are collections of rules, in a YAML or JSON file. These rules are taking parameters, and calling functions on certain parts of another YAML or JSON object being linted. 

### Adding a rule

Add your own rules under the `rules` property in your `.spectral.yml` ruleset file.

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

The example above adds a single rule that checks that tags objects have a description property defined.

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

### Formats

Formats are an optional way to specify which API description formats a rule, or ruleset, is applicable to. Currently Spectral supports these two formats:

- `oas2` (this is OpenAPI v2.0 - formerly known as Swagger)
- `oas3` (this is OpenAPI v3.0)

Specifying the format is optional, so you can completely ignore this if all the rules you are writing apply to any document you lint, or if you have specific rulesets for different formats. If you'd like to use one ruleset for multiple formats, the formats key is here to help.

```yaml
rules:
  api-servers:
    description: "OpenAPI `servers` must be present and non-empty array."
    recommended: true
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
  api-servers:
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

### Severity

The `severity` keyword is optional and can be `error`, `warn`, `info`, or `hint`.

### Then

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

### Extending Rules

Rulesets can extend other rulesets. For example, Spectral comes with two built in rulesets - one for OpenAPI v2 (`spectral:oas2`), and one for OpenAPI v3 (`spectral:oas3`). 

Use the `extends` property in your ruleset file to build upon or customize other rulesets.

```yaml
extends: spectral:oas2
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

### Enable Rules

Sometimes you might want to apply specific rules from another ruleset. Use the `extends` property, and pass `off` as the second argument in order to add the rules from another ruleset, but disable them all by default. This allows you to pick and choose which rules you would like to enable.

```yaml
extends: [[spectral:oas2, off]]
rules:
  # This rule is defined in the spectral:oas2 ruleset. We're passing `true` to turn it on and inherit the severity defined in the spectral:oas2 ruleset.
  operation-operationId-unique: true
```

The example above will run the single rule that we enabled, since we passed `off` to disable all rules by default when extending the `spectral:oas2` ruleset.

### Disable Rules

This example shows the opposite of the "Enabling Specific rules" example. Sometimes you might want to enable all rules by default, and disable a few.

```yaml
extends: [[spectral:oas2, all]]

rules:
  operation-operationId-unique: false
```

The example above will run all of the rules defined in the `spectral:oas2` ruleset (rather than the default behavior that runs only the recommended ones), with one exceptions - we turned `operation-operationId-unique` off.

The current recommended rules are marked with the property `recommended: true` in their respective rulesets:

- [Rules relevant to both OpenAPI v2 and v3](https://github.com/stoplightio/spectral/tree/master/src/rulesets/oas/index.json)
- [Rules specific to only OpenAPI v2](https://github.com/stoplightio/spectral/tree/master/src/rulesets/oas2/index.json)
- [Rules specific to only OpenAPI v3](https://github.com/stoplightio/spectral/tree/master/src/rulesets/oas3/index.json)

### Changing Severity of a Rule

```yaml
extends: spectral:oas2
rules:
  operation-2xx-response: warn
```

The example above will run the recommended rules from the `spectral:oas2` ruleset, but report `operation-2xx-response` as a warning rather than as an error (as is the default behavior in the `spectral:oas2` ruleset).

Available severity levels are `error`, `warn`, `info`, `hint`, and `off`.


### Adding a custom function

If the built-in functions are not enough, Spectral gives you a possibility of providing your own ones.
Previously, this used to be possible only in case of programmatic usage of Spectral, but there is no such limitation anymore,
and functions are an integral part of Spectral rulesets.

A custom function might be any JS function compliant with [IFunction](https://github.com/stoplightio/spectral/blob/90a0864863fa232bf367a26dace61fd9f93198db/src/types/function.ts#L3#L8) type.

```ts
export type IFunction<O = any> = (
  targetValue: any,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[];
```

#### Introduction

It takes exactly the same arguments as built-in functions do, so you are more than welcome to take a look at the existing implementation.

Before you write your first custom function, you must be wary of certain limitations that will apply.

First of all, the custom function must be synchronous.

Apart from the above, Spectral is meant to support a variety of environments, so ideally your function should have an equal or at least very similar functionality in Node.js, browsers etc.
That said, that's one of the core restriction, namely: do not rely on globals or functions specific to one particular environment.
If you need to access environment specific API, make sure you provide an alternative for other environments.
A good example of such situation is `fetch` - a function available natively in a browser context, but missing in Node.js.
To keep your code cross-platform, you shall consider using a package like node-fetch or isomorphic-fetch, which implement spec-compliant Fetch API and work in Node.js.
You are obviously allowed to use anything that's available natively in JS (ES2017), this is naturally a safe usage.


Besides that, we encourage you to not transpile the code to ES5 if you can help it. Spectral does not support older environments than ES2017, so there is no need to bloat the bundle with useless transformations and polyfills.
Ship untransformed async/await, do not include unneeded shims, it's all good.

Another caveat is that ES Modules and other modules systems are not supported. Although, you are recommended to write ES2017 code, you should not be using require or imports.
To give you an example of a good code
```js
module.exports = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```
You do not need to provide any shim for `Object.entries` or use [regenerator](https://facebook.github.io/regenerator/) for `for of` loop.
As stated, ou cannot use ES Modules, so the following code is considered sa invalid and won't work correctly.
```js
export default (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```
The following code won't work properly either
 ```js
const foo = require('./foo'); // require is not available (see note below)

module.exports = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```

If you have any module system, you need to use some bundler, preferably Rollup.js as it generates efficient bundles.
We are still evaluating the idea of supporting ESModule and perhaps we decide to bring support for ES Modules at some point,
yet for now you cannot use them.

#### How do I create a function?

The process of creating a function involves 2 steps:

- create a js file inside of a directory called `functions` that should be placed next to your ruleset file
- create a `functions` array in your ruleset if you haven't done it yet and place a string with the filename without `.js` extension

Example:

`functions/abc.js`

```js
module.exports = (targetVal) => {
  if (targetVal !== 'abc') {
    return [
      {
        message: 'Value must equal "abc".',
      },
    ];
  }
};
```

`my-ruleset.yaml`

```yaml
functions: [abc]
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "abc"
```

Optionally, if you'd like to validate the data that it passed to abc function before the function gets executed, you can provide a JSON Schema.
You can do it as follows

```yaml
functions: [[abc, { type: "string" }]] # can be any valid JSONSchema7
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "abc"
```

If for some reason, you do not want to place your functions in a directory called `functions`, you can specify a custom path.

```yaml
functionsDir: "./my-functions" # any relative path to the ruleset is okay
functions: [[abc, { type: "string" }]] # can be any valid JSONSchema7
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "abc"
```

Spectral would look for functions in a `my-functions` directory now.

#### Inheritance

Core functions can be overridden with custom rulesets, so if you'd like to make your own truthy go ahead. 
Other than that, custom functions are only available in the ruleset which defines them, so loading a foo in one ruleset will not clobber a foo in another ruleset.
