![Spectral logo](img/spectral-banner.png)

[![Test Coverage](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/test_coverage)](https://codeclimate.com/github/stoplightio/spectral/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/maintainability)](https://codeclimate.com/github/stoplightio/spectral/maintainability)

A flexible JSON object linter with out of the box support for OpenAPI v2 and v3

## Features

- Create custom rules to lint _any JSON object_
- Use JSON paths to apply rules / functions to specific parts of your JSON objects
- Built-in set of functions to help [build custom rules](#creating-a-custom-rule). Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc
- [Create custom functions](#creating-a-custom-function) for advanced use cases
- Optional ready to use rules and functions to validate and lint [OpenAPI v2 _and_ v3 documents](#example-linting-an-openapi-document)
- Validate JSON with [Ajv](https://github.com/epoberezkin/ajv)

## Installation

### Local Installation

```bash
npm install @stoplight/spectral
```

### Global Installation

```bash
npm install -g @stoplight/spectral
```

Supports Node v8.3+.

### Executable binaries

For users without Node and/or NPM/Yarn, we provide standalone packages for all major platforms:

- x64 Windows
- x64 MacOS
- x64 Linux

You can find them [here](https://github.com/stoplightio/spectral/releases).
Once downloaded, you can proceed with the standard procedure for running any CLI tool.

```bash
./spectral-macos lint petstore.yaml
```

Note, the binaries are *not* auto-updatable, therefore you will need to download a new version on your own.

#### Installing binaries system-wide

##### Linux

```bash
sudo mv ./spectral-linux /usr/local/bin/spectral
```

You may need to restart your terminal.
Now, `spectral` command will be accessible in your terminal.

Head over to [releases](https://github.com/stoplightio/spectral/releases) for the latest binaries.


### Docker
```bash
docker run --rm -it stoplight/spectral lint "${URL}"`
```

## Usage

### CLI

Spectral can be run via the command-line:

```bash
spectral lint petstore.yaml
```

Other options include:

``` text
  -c, --config=config          path to a config file
  -e, --encoding=encoding      text encoding to use
  -f, --format=json|stylish    formatter to use for outputting results
  -h, --help                   show CLI help
  -m, --maxResults=maxResults  deprecated: use --max-results instead
  -o, --output=output          output to a file instead of stdout
  -r, --ruleset=ruleset        path to a ruleset file (supports remote files)
  -s, --skip-rule=skip-rule    ignore certain rules if they are causing trouble
  -v, --verbose                increase verbosity
  --max-results=max-results    [default: all] maximum results to show
```

> Note: The Spectral CLI supports both YAML and JSON.

Currently, the CLI supports validation of OpenAPI documents and lints them based on our default ruleset. It does not support custom rulesets at this time. Although if you want to build and run custom rulesets outside of the CLI, see [Customization](#Customization).

## Programmatic usage

Spectral is written in TypeScript (JavaScript) and can be used directly for when working with the CLI isn't the right approach. Take a look at our ["JavaScript API documentation"](docs/js-api.md).

## Rulesets

You can find all about [rulesets here](docs/rulesets.md).

## FAQs

**How is this different than [Ajv](https://github.com/epoberezkin/ajv)?**

Ajv is a JSON Schema validator, not a linter. Spectral does expose a `schema` function that you can use in your rules to validate all or part of the target object with JSON Schema (Ajv is used under the hood). However, Spectral also provides a number of other functions and utilities that you can use to build up a linting ruleset to validates things that JSON Schema is not well suited for.

**I want to lint my OpenAPI documents but don't want to implement Spectral right now.**

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_campaign=spectral).

**What is the difference between Spectral and [Speccy](https://github.com/wework/speccy)?**

With Spectral, lint rules can be applied to _any_ JSON object. Speccy is designed to work with OpenAPI v3 only. The rule structure is different between the two. Spectral uses [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead of the `object` parameters (which are OpenAPI specific). Rules are also more clearly defined (thanks to TypeScript typings) and now require specifying a `type` parameter. Some rule types have been enhanced to be a little more flexible along with being able to create your own rules based on the built-in and custom functions.

## Contributing

If you are interested in contributing to Spectral itself, check out our [contributing docs](CONTRIBUTING.md) to get started.

Also, most of the interesting projects are built _with_ Spectral. Please consider using Spectral in a project or contribute to an [existing one](#example-implementations).

If you are using Spectral in your project and want to be listed in the examples section, we encourage you to open an [issue](https://github.com/stoplightio/spectral/issues).

### Example Implementations

- [Stoplight's Custom Style and Validation Rules](https://docs.stoplight.io/modeling/modeling-with-openapi/style-validation-rules) uses Spectral to validate and lint OpenAPI documents on the Stoplight platform
- [Spectral GitHub Bot](https://github.com/tbarn/spectral-bot), a GitHub pull request bot that lints your repo's OpenAPI document that uses the [Probot](https://probot.github.io) framework, built by [Taylor Barnett](https://github.com/tbarn)
- [Spectral GitHub Action](https://github.com/XVincentX/spectral-action), a GitHub Action that lints your repo's OpenAPI document, built by [Vincenzo Chianese](https://github.com/XVincentX/)

## Helpful Links

- [JSONPath Online Evaluator](http://jsonpath.com/), a helpful tool to determine what `path` you want
- [stoplightio/json](https://github.com/stoplightio/json), a library of useful functions for when working with JSON
- [stoplightio/yaml](https://github.com/stoplightio/yaml), a library of useful functions for when working with YAML, including parsing YAML into JSON, and a few helper functions such as `getJsonPathForPosition` or `getLocationForJsonPath`

## Thanks :)

- [Phil Sturgeon](https://github.com/philsturgeon) for collaboration and creating Speccy
- [Mike Ralphson](https://github.com/MikeRalphson) for kicking off the Spectral CLI

## Support

If you have a bug or feature request, please open an issue [here](https://github.com/stoplightio/spectral/issues).

If you need help using Spectral or have a support question, please use the [Stoplight Community forum](https://community.stoplight.io). We've created an open source category for these questions. It's also a great place to share your implementations.

If you want to discuss something in private, you can reach out to Stoplight support at [support@stoplight.io](mailto:support@stoplight.io).
