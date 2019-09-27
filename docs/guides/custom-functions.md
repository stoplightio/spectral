# Custom Functions

If the built-in functions are not enough, Spectral allows you to write and use your own custom functions.

A custom function might be any JS function compliant with [IFunction](https://github.com/stoplightio/spectral/blob/90a0864863fa232bf367a26dace61fd9f93198db/src/types/function.ts#L3#L8) type.

```ts
export type IFunction<O = any> = (
  targetValue: any,
  options: O,
  paths: IFunctionPaths,
  otherValues: IFunctionValues,
) => void | IFunctionResult[];
```

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
- - equals
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

Where the function **functions/equals.js** might look like:

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

## Inheritance

Core functions can be overridden with custom rulesets, so if you'd like to make your own truthy go ahead. Custom functions are only available in the ruleset which defines them, so loading a foo in one ruleset will not clobber a foo in another ruleset.

## Supporting Multiple Environments

Spectral is meant to support a variety of environments, so ideally your function should behave similarly in Node.js and browser contexts. Do not rely on globals or functions specific to a particular environment. For example, do not expect the browser `window` global to always be available, since this global is not available in Node.js environments.

If you need to access environment specific APIs, make sure you provide an alternative for other environments. A good example of such a situation is `fetch` - a function available natively in a browser context, but missing in Node.js.

To keep your code cross-platform, you'd need to use a cross platform package such as `node-fetch` or `isomorphic-fetch`, both of which implement spec-compliant fetch API and work in Node.js.

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

You do not need to provide any shim for `Object.entries` or use [regenerator](https://facebook.github.io/regenerator/) for `for of` loop. As stated, you cannot use ES Modules, so the following code is considered sa invalid and won't work correctly.

```js
export default (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```

The following code won't work properly either:

 ```js
const foo = require('./foo'); // require is not available (see note below)

module.exports = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    // this is a perfectly fine code
  }
};
```

If you have any module system, you need to use some bundler, preferably Rollup.js as it generates efficient bundles.

We are still evaluating the idea of supporting ESModule and perhaps we decide to bring support for ES Modules at some point, yet for now you cannot use them.
