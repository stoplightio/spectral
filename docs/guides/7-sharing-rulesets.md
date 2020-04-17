## Sharing & Distributing Rulesets

A [ruleset](../getting-started/rulesets.md) becomes infinitely more useful when other developers are using it. By itself, it's just a way of enforcing some rules on a single project, but when distributed a ruleset can become a "style guide" for enforcing consistency across a whole bunch of projects!

To help you out distribute your rulesets among the others, Spectral provides a few ways to load rulesets from a variety of resources:

- via the filesystem
- via a HTTP server
- via [npm](https://www.npmjs.com/)

```yaml
extends:
  - ./config/spectral.json
  - https://example.org/api/style.yaml
  - some-npm-module
```

### NPM

This should be the preferable choice of distributing the rulesets.
Not only it lets you serve files without a need for hosting your own server or uploading it somewhere else, but also supports versioning out of the box.
You can find more documentation on how the packaging and publishing process looks like in their [docs](https://docs.npmjs.com/packages-and-modules/).
This is a very basic example showing how the directory structure as well as package.json may look like.

Your `package.json`.

```json
{
  "name": "example-spectral-ruleset",
  "version": "0.0.0",
  "description": "Example Spectral ruleset",
  "main": "index.json",
  "scripts": {},
  "license": "ISC"
}
```

Actual ruleset called `index.json`

```json
{
  "functions": ["min"],
  "rules": {
    "valid-foo-value": {
      "given": "$",
      "then": {
        "field": "foo",
        "function": "min",
        "functionOptions": {
          "value": 1
        }
      }
    }
  }
}
```

And, optionally, a custom function, `functions/min.js`

```js
'use strict';

module.exports = function (targetVal, { min }) {
  if (typeof targetVal !== 'number') {
    return [
      {
        message: 'Value is not a number.',
      },
    ];
  }

  if (targetVal < min) {
    return [
      {
        message: `Value is lower than ${min}`,
      },
    ];
  }
}
```

The end ruleset can extend your ruleset as follows

```json
{
  "extends": ["example-spectral-ruleset"]
}
```

Pegging a ruleset on given version can be done in the following manner:

```json
{
  "extends": ["example-spectral-ruleset@0.0.2"]
}
```
