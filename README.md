![Spectral logo](img/spectral-banner.png)

[![Test Coverage](https://api.codeclimate.com/v1/badges/1aa53502913a428f40ac/test_coverage)](https://codeclimate.com/github/stoplightio/spectral/test_coverage)
[![CircleCI](https://circleci.com/gh/stoplightio/spectral.svg?style=svg)](https://circleci.com/gh/stoplightio/spectral)

A flexible JSON linter with out of the box support for OpenAPI v2 and v3.

![Demo of Spectral linting an OpenAPI document from the CLI](./docs/demo.svg)

## Features

- Create custom rules to lint JSON or YAML objects
- Ready to use rules to validate and lint OpenAPI v2 _and_ v3 documents
- Use JSON path to apply rules to specific parts of your objects
- Built-in set of functions to help [create custom rules](#creating-a-custom-rule). Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc.
- [Create custom functions](#creating-a-custom-function) for advanced use cases
- Validate JSON with [Ajv](https://www.npmjs.com/package/ajv)

## Installation

```bash
# npm
npm install -g @stoplight/spectral

# yarn
yarn global add @stoplight/spectral

# docker
docker run --rm -it stoplight/spectral lint "${URL}"`
```

[Executable binaries](#executable-binaries) are also available.

## Usage

Please check out our `docs` directory. A good point to start is the [CLI section][cli-docs]

### TypeScript (JavaScript)

Spectral is written in TypeScript (JavaScript) and can be imported and used directly. Take a look at the [JavaScript API](./docs/js-api.md).

### Examples

- [Make a custom rule]()
- [Extend the built in OpenAPI v2 or v3 config]()
- [Turn a rule off]()
- [Change the severity of a rule]()

## Concepts

There are three key concepts in Spectral: **Rulesets**, **Rules**, and **Functions**.

- **Rulesets** act as a container for rules and functions.
- **Rules** filter your object down to a set of target values, and specify the function that is used to evaluate those values.
- **Functions** accept a value and return issue(s) if the value is incorrect.

Think of a **Spectral Config** as a flexible and customizable style guide for your JSON objects.

## FAQs

**How is this different than [Ajv](https://www.npmjs.com/package/ajv)?**

Ajv is a JSON Schema validator, not a linter. Spectral does expose a `schema` function that you can use in your rules to validate all or part of the target object with JSON Schema (Ajv is used under the hood). However, Spectral also provides a number of other functions and utilities that you can use to build up a linting ruleset to validates things that JSON Schema is not well suited for.

**I want to lint my OpenAPI documents but don't want to implement Spectral right now.**

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_campaign=spectral).

**What is the difference between Spectral and [Speccy](https://github.com/wework/speccy)?**

With Spectral, lint rules can be applied to _any_ JSON object. Speccy is designed to work with OpenAPI v3 only. The rule structure is different between the two. Spectral uses [JSONPath](http://goessner.net/articles/JsonPath/) `path` parameters instead of the `object` parameters (which are OpenAPI specific). Rules are also more clearly defined (thanks to TypeScript typings) and now require specifying a `type` parameter. Some rule types have been enhanced to be a little more flexible along with being able to create your own rules based on the built-in and custom functions.

### Executable binaries

For users without Node and/or NPM/Yarn, we provide standalone packages for [all major platforms](https://github.com/stoplightio/spectral/releases). We also provide a shell script to auto download the executable based on your operating system:

```bash
curl -L https://raw.githack.com/stoplightio/spectral/master/install.sh | sh
```

Note, the binaries are *not* auto-updatable, therefore you will need to download a new version on your own.

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
