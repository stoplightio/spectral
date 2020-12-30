[![Demo of Spectral linting an OpenAPI document from the CLI](./docs/img/readme-header.svg)](https://stoplight.io/api-governance?utm_source=github&utm_medium=spectral&utm_campaign=readme)
[![CircleCI](https://img.shields.io/circleci/build/github/stoplightio/spectral/master)](https://circleci.com/gh/stoplightio/spectral) [![NPM Downloads](https://img.shields.io/npm/dw/@stoplight/spectral?color=blue)](https://www.npmjs.com/package/@stoplight/spectral) [![Treeware (Trees)](https://img.shields.io/treeware/trees/stoplightio/spectral)](https://plant.treeware.earth/stoplightio/spectral)

- **Custom Rulesets**: Create custom rules to lint JSON or YAML objects
- **Ready-to-use Rulesets**: Validate and lint **OpenAPI v2 & v3** and **AsyncAPI** Documents
- **JSON Path Support**: Use JSON path to apply rules to specific parts of your objects
- **Ready-to-use Functions**: Built-in set of functions to help [create custom rules](https://meta.stoplight.io/docs/spectral/docs/guides/4-custom-rulesets.md#adding-rules). Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc.
- **Custom Functions**: Create custom functions for advanced use cases
- **JSON Validation**: Validate JSON with [Ajv](https://www.npmjs.com/package/ajv)

![Demo of Spectral linting an OpenAPI document from the CLI](./docs/img/demo.svg)

# Overview

- [Installation and Usage](#-installation-and-Usage)
- [Documentation and Community](#-documentation-and-community)
- [FAQs](#-faqs)
- [Contributing](#-contributing)

## 🧰 Installation and Usage

**Install**

```bash
npm install -g @stoplight/spectral

# OR

yarn global add @stoplight/spectral
```

Find more [installation methods](https://meta.stoplight.io/docs/spectral/docs/getting-started/2-installation.md) in our documentation.

**Lint**

```bash
spectral lint petstore.yaml
```

## 📖 Documentation and Community

- [Documentation](https://meta.stoplight.io/docs/spectral/docs/getting-started/1-concepts.md)
  - [Getting Started](https://meta.stoplight.io/docs/spectral/docs/getting-started/1-concepts.md) - The basics of Spectral.
  - [Different Workflows](https://meta.stoplight.io/docs/spectral/docs/guides/1-workflows.md) - When and where should you use Spectral? Editors, Git-hooks, Continuous Integration, GitHub Actions, wherever you like!
  - [Using the command-line interface](https://meta.stoplight.io/docs/spectral/docs/guides/2-cli.md) - Quickest way to get going with Spectral is in the CLI.
  - [Using the JavaScript API](https://meta.stoplight.io/docs/spectral/docs/guides/3-javascript.md) - Access the _raw power_ of Spectral via the JS, or hey, TypeScript if you want.
  - [Custom Rulesets](https://meta.stoplight.io/docs/spectral/docs/guides/4-custom-rulesets.md) - Don't like our rules? Throw 'em out and make your own.
  - [Custom Functions](https://meta.stoplight.io/docs/spectral/docs/guides/5-custom-functions.md) - Rules can do absolutely anything, just write a little code.
    Take a look at our [getting started documentation](https://meta.stoplight.io/docs/spectral/docs/getting-started/1-concepts.md), then peek through some of our guides:

## ℹ️ Support

If you need help using Spectral or have a support question, please use [GitHub Discussions](https://github.com/stoplightio/spectral/discussions). It's also a great place to share your rulesets, or tools that leverage Spectral.

If you have a bug or feature request, please [create an issue](https://github.com/stoplightio/spectral/issues).

## ❓ FAQs

### How is this different to Ajv

[Ajv](https://www.npmjs.com/package/ajv) is a JSON Schema validator, and Spectral is a JSON/YAML linter. Instead of just validating against JSON Schema, it can be used to write rules for any sort of JSON/YAML object, which could be JSON Schema, or OpenAPI, or anything similar. Spectral does expose a [`schema` function](https://meta.stoplight.io/docs/spectral/docs/reference/functions.md) that you can use in your rules to validate all or part of the target object with JSON Schema (we even use Ajv used under the hood for this), but that's just one of many functions.

### I want to lint my OpenAPI documents but don't want to implement Spectral right now.

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_medium=spectral&utm_campaign=readme).

### What is the difference between Spectral and Speccy

[Speccy](https://github.com/wework/speccy) was a great inspiration for Spectral, but was designed to work only with OpenAPI v3. Spectral can apply rules to _any_ JSON/YAML object (including OpenAPI v2/v3 and AsyncAPI). It's mostly been abandoned now, and is JavaScript not TypeScript.

## ⚙️ Integrations

- [Stoplight Studio](https://stoplight.io/studio?utm_source=github&utm_medium=spectral&utm_campaign=readme) uses Spectral to validate and lint OpenAPI documents.
- [Spectral GitHub Action](https://github.com/stoplightio/spectral-action), lints documents in your repo, built by [Vincenzo Chianese](https://github.com/XVincentX/).
- [VS Code Spectral](https://github.com/stoplightio/vscode-spectral), all the power of Spectral without leaving VS Code.

## 🏁 Help Others Utilize Spectral

If you're using Spectral for an interesting use case, [contact us](mailto:growth@stoplight.io) for a case study. We'll add it to a list here. Spread the goodness 🎉

## 👏 Contributing

If you are interested in contributing to Spectral, check out [CONTRIBUTING.md](CONTRIBUTING.md).

## 🎉 Thanks

- [Mike Ralphson](https://github.com/MikeRalphson) for kicking off the Spectral CLI and his work on Speccy
- [Jamund Ferguson](https://github.com/xjamundx) for JUnit formatter
- [Sindre Sorhus](https://github.com/sindresorhus) for Stylish formatter
- Julian Laval for HTML formatter
- [@nulltoken](https://github.com/nulltoken) for a whole bunch of amazing features

## 📜 License

Spectral is 100% free and open-source, under [Apache License 2.0](LICENSE).

## 🌲 Sponsor Spectral by Planting a Tree

This package is [Treeware](https://treeware.earth) so if you would like to thank us for creating it, we ask that you [**buy the world a tree**](https://plant.treeware.earth/stoplightio/spectral).
