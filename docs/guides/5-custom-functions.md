# Custom Functions

If the core functions are not enough for your [custom ruleset](../guides/3-rulesets.md), Spectral allows you to write and use your own custom functions.

Create a directory to contain your new functions. By default `functions/` is assumed.

**functions/abc.js**

```js
export default input => {
  if (input !== "hello") {
    return [
      {
        message: 'Value must equal "hello".',
      },
    ];
  }
};
```

The function is exported anonymously but it has the name `abc` from the file. This name is then loaded in your [ruleset](../guides/4-custom-rulesets.md), via `functions: [abc]`.

**my-ruleset.yaml**

```yaml
functions: [abc]
rules:
  my-rule:
    message: "{{error}}"
    given: "$.greeting.message"
    then:
      function: "abc"
```

The function is looking for a targetVal of `"hello"` for anywhere its applied, and this rule uses a given target of `$.greeting`.

If the object being linted looks like this, everything is going to be ok.

```yaml
greeting:
  message: hello
```

If the message was goodbye, we'd have a problem.

## Writing Functions

A custom function might be any JavaScript function compliant with `RulesetFunction` type.

```ts
export type RulesetFunction<I extends unknown = unknown, O extends unknown = unknown> = (
  input: I,
  options: O,
  context: RulesetFunctionContext,
) => void | IFunctionResult[] | Promise<void | IFunctionResult[]>;

export type RulesetFunctionContext = {
  path: JsonPath;
  document: IDocument;
  documentInventory: IDocumentInventory;
  rule: IRule;
};
```

### Validating options

If you are writing a function that accepts options, you should provide a JSON Schema that describes those options.

You can do it as follows:

```yaml
functions:
  - equals
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
import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction({
  input: null,
  options: {
    type: 'object',
    additionalProperties: false,
    properties: {
      value: true,
    },
    required: ['value'],
  },
}, (input, options) => {
  const { value } = options;

  if (targetVal !== value) {
    return [
      {
        message: `Value must equal ${value}.`,
      },
    ];
  }
};
```

### input

`input` the value the custom function is provided with and is supposed to lint against.

It's based on `given` [JSON Path][jsonpath] expression defined on the rule and optionally `field` if placed on `then`.

For example, a rule might have `given` with a JSON Path expression of `$`, and the following partial of an OpenAPI document:

```yaml
openapi: 3.0.0
info:
  title: foo
```

In this example, `targetValue` would be a JavaScript object literal containing `openapi` and `info` properties. If you changed `given` to `$.info.title`, then `targetValue` would equal `"foo"`.

### options

Options corresponds to `functionOptions` that's defined in `then` property of each rule.

Each rule can specify options that each function should receive. This can be done as follows

```yaml
operation-id-kebab-case:
  given: "$"
  then:
    function: pattern
    functionOptions: # this object be passed down as options to the custom function
      match: ^[a-z][a-z0-9\-]*$
```

### context

`context.path` contains a resolved property path pointing to the place in the document

`context.document` provides an access to the document that we attempt to lint.
You may find it useful if you'd like to see which formats were applied to it, or in case you'd like to get its unresolved version.

`context.documentInventory` provides an access to resolved and unresolved documents as well, $ref resolution graph, as some other advanced properties.
You shouldn't need it for most of the time.

`context.rule` an actual rule your function was called for.

Custom functions take exactly the same arguments as core functions do, so you are more than welcome to take a look at the existing implementation.

The process of creating a function involves 2 steps:

- create a js file inside of a directory called `functions` that should be placed next to your ruleset file
- create a `functions` array in your ruleset if you haven't done it yet and place a string with the filename without `.js` extension

## Returning multiple results

Many functions will return a single message, but it is possible for a function to return multiple.

For example, if a rule is created to make sure something is unique, it could either:

- return a single error for the entire array which lists offending values in a comma separated list
- return a single error for the array value which contains the first offending non-unique item
- return multiple errors for each duplicate value located

How exactly you chose to implement messages depends on the rule at hand and probably personal preference too.

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
import { isPlainObject } from "@stoplight/json";

const NAME_PROPERTY = "name";

export default createRulesetFunction(
  {
    input: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
      },
    },
    options: null,
  },
  (input, options, { path }) => {
    const seen = [];
    const results = [];

    for (const [i, value] of input.keys()) {
      if (targetVal[i] === null || typeof targetVal[i] !== "object") {
        continue;
      }

      const tagName = input[i][NAME_PROPERTY];

      if (tagName === void 0) {
        continue;
      }

      if (seen.includes(tagName)) {
        results.push({
          message: `Duplicate tag name '${tagName}'`,
          path: [...path, i, NAME_PROPERTY],
        });
      } else {
        seen.push(tagName);
      }
    }

    return results;
  },
);
```

It's worth keeping in mind, Spectral will attempt to deduplicate messages when they bear the same `code` and target the same `path`.

As such, when your custom function is susceptible to return more than one result, you have to specify a different `path` for each result.

## Referencing core functions

Your custom function may also build on top of existing functions Spectral offers.
Make sure to provide all arguments that was originally passed to your function, otherwise a core function may misbehave.

### Example

```js
import { truthy } from "@stoplight/spectral-functions";

export default function (input, ...args) {
  if (input.info["skip-info"] === true) {
    // if info has a property with key called "skip-info" and its value is true, let's do nothing
    return;
  }

  // otherwise call the truthy function
  return truthy(input.info, ...args);
}
```

## Async Functions

As of Spectral 5.4.0, custom functions can also be asynchronous.

<!-- theme: warning -->

> Ideally linting should always be deterministic, which means if its run 10 times it should return the same results 10 times. To ensure this is the case, please refrain from introducing any logic that is prone to non-deterministic behavior. Examples of this might be contacting external service you have no control over, or that might be unstable, or change the way it responds over time.
> While, it may seem tempting to have a function that does so, the primary use case is to support libraries that makes async fs calls or exchanging information, i.e. obtaining a dictionary file, with a locally running server, etc.

**functions/dictionary.js**

```js
const CACHE_KEY = "dictionary";

let dictionary;

export default async function (input) {
  if (!dictionary) {
    const res = await fetch("https://dictionary.com/evil");
    if (res.ok) {
      dictionary = await res.json();
    } else {
      // you can either re-try or just throw an error
    }
  }

  if (dictionary.includes(input)) {
    return [{ message: `\`${input}\` is a forbidden word.` }];
  }
}
```

**my-ruleset.yaml**

```yaml
functions:
  - dictionary
rules:
  no-evil-words:
    message: "{{error}}"
    given:
      - "$.info.title"
      - "$.info.description"
    then:
      function: "dictionary"
```

## Changing Directory

Want to place your functions in somewhere other than the `functions/` directory? Use the `functionsDir` keyword in your ruleset.

```yaml
functions:
  - abc
# any path relative to the ruleset file is okay
functionsDir: "./my-functions"
rules:
  my-rule:
    message: "{{error}}"
    given: "$.info"
    then:
      function: "abc"
```

## Security Concerns

Please, do keep in mind that for the time being, the code is **not** executed in a sandboxed environment, so be very careful when including external rulesets.

This indicates that almost any arbitrary code can be executed.

Potential risks include:

- data / credentials infiltration,
- data tampering,
- running cpu-intensive tasks, i.e. crypto-mining.

While the risk is relatively low, you should be careful about including **external rulesets** you are not in charge of, in particular those that leverage custom functions.
You are strongly encouraged to review the custom functions a given ruleset provides.
What you should hunt for is:

- obfuscated code,
- calls to an untrusted external library,
- places where remote code is executed.

If you notice any weirdness, consider forking the ruleset and removal of any evil-looking code.

## Inheritance

Core functions can be overridden with custom rulesets, so if you'd like to make your own truthy go ahead. Custom functions are only available in the ruleset which defines them, so loading a foo in one ruleset will not clobber a foo in another ruleset.

## Performance tips

- try to avoid allocating objects as much as possible if your custom function might is very generic, and therefore is expected to be used by plenty of rules.
  If your document is huge enough, and JSON path expression is loose (meaning it matches a lot of properties), your function might be called hundreds of thousands of times.

```js
// bad
export default (targetVal, { excludedWords }) => {
  const results = []; // the array is always allocated, even if targetVal is perfectly valid

  if (excludedWords.includes("foo")) {
    results.push({ error: "Forbidden word used" });
  }

  return results;
};
```

```js
// better, no temporary array if targetVal is valid
export default (targetVal, { excludedWords }) => {
  if (excludedWords.includes("foo")) {
    return [{ error: "Forbidden word used" }];
  }
};
```

## Supporting Multiple Environments

Spectral is meant to support a variety of environments, so ideally your function should behave similarly in Node.js and browser contexts. Do not rely on globals or functions specific to a particular environment. For example, do not expect the browser `window` global to always be available, since this global is not available in Node.js environments.

If you need to access environment specific APIs, make sure you provide an alternative for other environments. A good example of such a situation is `fetch` - a function available natively in a browser context, but missing in Node.js.

To keep your code cross-platform, you'd need to use a cross platform package such as [node-fetch](https://www.npmjs.com/package/node-fetch) or [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch), both of which implement spec-compliant fetch API and work in Node.js.

## Code Transpilation

We encourage you to not transpile the code to ES5 if you can help it. Spectral does not support older environments than ES2019, so there is no need to bloat the bundle with useless transformations and polyfills. Ship untransformed async/await, do not include unneeded shims, it's all good.

Prior to 6.x, Spectral hadn't supported ES Modules, yet as of recently using ES Modules is the recommended way to do things.

[jsonpath]: https://jsonpath.com/
