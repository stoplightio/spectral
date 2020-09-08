# Sharing & Distributing Rulesets

A [ruleset](../getting-started/3-rulesets.md) becomes infinitely more useful when other developers are using it. By itself, it's just a way of enforcing some rules on a single project, but when distributed a ruleset can become a "style guide" for enforcing consistency across a whole bunch of projects!

To help you out distribute your rulesets among the others, Spectral provides a few ways to load rulesets from a variety of resources:

- via a HTTP server
- via [NPM](#NPM)
- via the filesystem

Or mix and match!

```yaml
extends:
  - ./config/spectral.json
  - https://example.org/api/style.yaml
  - some-npm-module
```

There are various pros and cons to each approach, so see what is right for you.

## HTTP Server

At its most basic level, a Spectral ruleset is just a JSON or YAML file. It can be hosted anywhere you like: on your web hosting, Amazon S3, or anywhere text files are accessible, and then pulled into your own local ruleset in the filesystem:

**ruleset.yaml**

```yaml
extends:
- https://example.com/company-ruleset.yaml
```

You can even shove them up on GitHub:

```yaml
# why not give this one a try! 🥳
extends:
- https://raw.githubusercontent.com/openapi-contrib/style-guides/master/apisyouwonthate.yml
```

As with any ruleset, you can pass these directly to the [Spectral CLI](./2-cli.md):

```shell
spectral lint -r https://example.com/some-ruleset.yml
```

## NPM

As Spectral is a [NPM](https://www.npmjs.com/) package, we support loading rulesets from other NPM packages.

Not only it lets you serve files without a need for hosting your own server or uploading it somewhere else, but also supports versioning out of the box, and makes it easy to bundle a ruleset with custom rulesets.

This is a very basic example showing how the directory structure as well as package.json may look like.

**package.json**

```json
{
  "name": "example-spectral-ruleset",
  "version": "0.0.0",
  "description": "Example Spectral ruleset",
  "main": "ruleset.json",
  "scripts": {},
  "license": "ISC"
}
```

**ruleset.json**

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

**functions/min.js**

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

Developers wanting to pull in your ruleset can just reference the module name in `extends`:

```yaml
extends:
  - example-spectral-ruleset
```

Pegging a ruleset on given version is possible:

```yaml
extends:
  - "example-spectral-ruleset@0.2.0"
```

## Filesystem

If you want to share Spectral rulesets between multiple repositories, you may need to use something like [Git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to clone down another repository into your repository.

```bash
git submodule add https://github.com/some-org/style-guide
```

With that in place, you reference the files inside it:

```yaml
extends:
  - ./style-guide/spectral.json
```

If you need custom functions this will work, as `functionsDir` can point to a directory inside `style-guide/` and all the JavaScript files can live in there too.
