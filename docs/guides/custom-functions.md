# Custom Functions

If the built-in functions are not enough for your [custom ruleset](../getting-started/rulesets.md), Spectral allows you to write and use your own custom functions.

A custom function might be any JavaScript function compliant with [IFunction](https://github.com/stoplightio/spectral/blob/90a0864863fa232bf367a26dace61fd9f93198db/src/types/function.ts#L3#L8) type.

```ts
export type IFunction<O = any> = (
  targetValue: any,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[];
```

### targetValue
 
`targetValue` the value the custom function is provided with and is supposed to lint against.

It's based on `given` [JSONPath][jsonpath] expression defined on the rule and optionally `field` if placed on `then`.

For example, a rule might have `given` with a JSONPath expression of `$`, and the following partial of OpenAPI 3.0 document:

```yaml
openapi: 3.0.0
info:
  title: foo
```

In this example, `targetValue` would be a JS object literal containing `openapi` and `info` properties. If you changed `given` to `$.info.title`, then `targetValue` would equal `"foo"`.

### options

Options corresponds to `functionOptions` that's defined in `then` property of each rule.

Each rule can specify options that each function should receive. This can be done as follows

```yaml
operation-id-kebab-case:
  given: "$"
  then:
    function: pattern
    functionOptions:  # this object be passed down as options to the custom function
      match: ^[a-z][a-z0-9\-]*$
```

### paths

`paths.given` contains [JSONPath][jsonpath] expression you set in a rule - in `given` field.

If a particular rule has a `field` property in `then`, that path will be exposed as `paths.target`.

### otherValues

`otherValues.original` and `otherValues.given` are equal for the most of time and represent the value matched using JSONPath expression.

`otherValues.resolved` serves for internal purposes, therefore we discourage using it in custom functions.

Custom functions take exactly the same arguments as built-in functions do, so you are more than welcome to take a look at the existing implementation.

The process of creating a function involves 2 steps:

- create a js file inside of a directory called `functions` that should be placed next to your ruleset file
- create a `functions` array in your ruleset if you haven't done it yet and place a string with the filename without `.js` extension

#### Example:

**functions/abc.js**

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

**my-ruleset.yaml**

```yaml
functions: [abc]
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "abc"
```

If you are writing a function that accepts options, you should provide a JSON Schema that describes those options.

You can do it as follows:

```yaml
functions:
- equals
  # can be any valid JSONSchema7
  - properties:
      value:
        type: string
        description: Value to check equality for
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "equals"
      functionOptions:
        value: "abc"
```

Where the function `functions/equals.js` might look like:

```js
module.exports = (targetVal, opts) => {
  const { value } = opts;

  if (targetVal !== value) {
    return [
      {
        message: `Value must equal {value}.`,
      },
    ];
  }
};
```

If for some reason, you do not want to place your functions in a directory called `functions`, you can specify a custom directory.

```yaml
functions: [abc]
# any path relative to the ruleset file is okay
functionsDir: "./my-functions"
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "abc"
```

Spectral would look for functions in a `my-functions` directory now.

## Returning multiple results

Many functions will return a single message, but its possible for a function to return multiple.

For example, if a rule is created to make sure something is unique, it could either:

- return a single error for the entire array which lists offending values in a comma separated list
- return a single error for the array value which contains the first offending non-unique item
- return multiple errors for each duplicate value located

How exactly you chose to implement messages depends on the rule at hand and probably personal preference too.

It's worth keeping in mind, Spectral will attempt to deduplicate messages when they bear the same `code` and target the same `path`.
As such, when your custom function is susceptible to return more than one result, you have to specify a different `path`
for each result. 

Below a sample function that checks tags bear unique names.

**my-ruleset.yaml**

```yaml
functions: [uniqueTagNames]
rules:
  unique-tag-names:
    message: "Tags should have distinct names: {{error}}"
    given: "$.tags"
    then:
      function: "uniqueTagNames"
```

**functions/uniqueTagNames.js**

```js
const NAME_PROPERTY = 'name';

module.exports = (targetVal, _opts, paths) => {
    if (!Array.isArray(targetVal)) {
        return;
    }

    const seen = [];
    const results = [];

    const rootPath = paths.target !== void 0 ? paths.target : paths.given;

    for (let i = 0; i < targetVal.length; i++) {
        if (targetVal[i] === null || typeof targetVal[i] !== 'object') {
           continue;
        }

        const tagName = targetVal[i][NAME_PROPERTY];

        if (tagName === void 0) {
            continue;
        }

        if (seen.includes(tagName)) {
            results.push(
                {
                    message: `Duplicate tag name '${tagName}'`,
                    path: [...rootPath, i, NAME_PROPERTY]
                },
            );
        } else {
            seen.push(tagName);
        }
    }

    return results;
};
```

## Inheritance

Core functions can be overridden with custom rulesets, so if you'd like to make your own truthy go ahead. Custom functions are only available in the ruleset which defines them, so loading a foo in one ruleset will not clobber a foo in another ruleset.

## Supporting Multiple Environments

Spectral is meant to support a variety of environments, so ideally your function should behave similarly in Node.js and browser contexts. Do not rely on globals or functions specific to a particular environment. For example, do not expect the browser `window` global to always be available, since this global is not available in Node.js environments.

If you need to access environment specific APIs, make sure you provide an alternative for other environments. A good example of such a situation is `fetch` - a function available natively in a browser context, but missing in Node.js.

To keep your code cross-platform, you'd need to use a cross platform package such as [node-fetch](https://www.npmjs.com/package/node-fetch) or [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch), both of which implement spec-compliant fetch API and work in Node.js.

## Code Transpilation

We encourage you to not transpile the code to ES5 if you can help it. Spectral does not support older environments than ES2017, so there is no need to bloat the bundle with useless transformations and polyfills. Ship untransformed async/await, do not include unneeded shims, it's all good.

Another caveat is that ES Modules and other modules systems are not supported. Although, you are recommended to write ES2017 code, you should not be using require or imports.

To give you an example of a good code:

```js
module.exports = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```

You do not need to provide any shim for `Object.entries` or use [regenerator](https://facebook.github.io/regenerator/) for the `for of` loop. As stated, you cannot use ES Modules, so the following code is considered as invalid and won't work correctly.

```js
export default (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```

Require calls will work only in Node.js, and will cause errors for anyone trying to use the ruleset in the browser. If your ruleset is definitely going to only be used in the context of NodeJS then using them is ok, but if you are distributing your rulesets to the public we recommend avoiding the use of `require()` to increase portability.

 ```js
const foo = require('./foo');

module.exports = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```

If you have any module system, you need to use some bundler, preferably Rollup.js as it generates efficient bundles.

We are still evaluating the idea of supporting ESModule and perhaps we will decide to bring support for ES Modules at some point, yet for now you cannot use them.

[jsonpath]: https://jsonpath.com/
