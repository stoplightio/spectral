[![](https://raw.githubusercontent.com/stoplightio/spectral/develop/docs/img/readme-header.svg)](https://stoplight.io/api-governance?utm_source=github&utm_medium=spectral&utm_campaign=readme)
[![CircleCI](https://img.shields.io/circleci/build/github/stoplightio/spectral/develop)](https://circleci.com/gh/stoplightio/spectral) [![NPM Downloads](https://img.shields.io/npm/dw/@stoplight/spectral-cli?color=blue)](https://www.npmjs.com/package/@stoplight/spectral-cli) [![Stoplight Forest](https://img.shields.io/ecologi/trees/stoplightinc)][stoplight_forest]

- **Custom Rulesets**: Create custom rules to lint JSON or YAML objects
- **Ready-to-use Rulesets**: Validate and lint **OpenAPI v2 & v3.x**, **AsyncAPI**, and **Arazzo v1** Documents
- **JSON Path Support**: Use JSON path to apply rules to specific parts of your objects
- **Ready-to-use Functions**: Built-in set of functions to help [create custom rules](https://meta.stoplight.io/docs/spectral/docs/guides/4-custom-rulesets.md#adding-rules). Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc.
- **Custom Functions**: Create custom functions for advanced use cases
- **JSON Validation**: Validate JSON with [Ajv](https://www.npmjs.com/package/ajv)

![Spectral linting an OpenAPI document from the CLI with results being output](https://raw.githubusercontent.com/stoplightio/spectral/develop/docs/img/demo.svg)

# Overview

- [Installation and Usage](#-installation-and-Usage)
- [Documentation and Community](#-documentation-and-community)
- [FAQs](#-faqs)
- [Contributing](#-contributing)

## 🧰 Installation and Usage

**Install**

```bash
npm install -g @stoplight/spectral-cli

# OR

yarn global add @stoplight/spectral-cli
```

Find more [installation methods](https://meta.stoplight.io/docs/spectral/docs/getting-started/2-installation.md) in our documentation.

**Lint**

```bash
spectral lint petstore.yaml
```

## 📖 Documentation and Community

- [Documentation](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mg-concepts)
  - [Getting Started](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mg-concepts) - The basics concepts, what Spectral is about.
  - [Using the Command-line Interface](https://meta.stoplight.io/docs/spectral/ZG9jOjI1MTg1-spectral-cli) - Learn how the command line interface works.
  - [Continuous Integration](https://meta.stoplight.io/docs/spectral/ZG9jOjExNTMyOTAx-continuous-integration) - Spectral CLI can be run anywhere that NPM packages can be installed and run via CLI.
  - [Custom Rulesets](https://meta.stoplight.io/docs/spectral/ZG9jOjI1MTg5-custom-rulesets) - Don't like our rules? Throw 'em out and make your own.
  - [Custom Functions](https://meta.stoplight.io/docs/spectral/ZG9jOjI1MTkw-custom-functions) - When the core functions are not enough to solve a problem, you can write custom functions to do _anything_.

## ℹ️ Support

If you need help using Spectral or have a support question, please use [GitHub Discussions](https://github.com/stoplightio/spectral/discussions). It's also a great place to share your rulesets, or tools that leverage Spectral.

If you have a bug or feature request, please [create an issue](https://github.com/stoplightio/spectral/issues).

## ❓ FAQs

### How is this different to Ajv

[Ajv](https://www.npmjs.com/package/ajv) is a JSON Schema validator, and Spectral is a JSON/YAML linter. Instead of just validating against JSON Schema, it can be used to write rules for any sort of JSON/YAML object, which could be JSON Schema, or OpenAPI, or anything similar. Spectral does expose a [`schema` function](https://meta.stoplight.io/docs/spectral/docs/reference/functions.md) that you can use in your rules to validate all or part of the target object with JSON Schema (we even use Ajv used under the hood for this), but that's just one of many functions.

### I want to lint my OpenAPI documents but don't want to implement Spectral right now.

No problem! A hosted version of Spectral comes **free** with the Stoplight platform. Sign up for a free account [here](https://stoplight.io/?utm_source=github&utm_medium=spectral&utm_campaign=readme).

### What is the difference between Spectral and Speccy

[Speccy](https://github.com/wework/speccy) was a great inspiration for Spectral, but was designed to work only with OpenAPI v3. Spectral can apply rules to _any_ JSON/YAML object (including OpenAPI v2/v3, Arazzo, and AsyncAPI). Speccy has mostly been abandoned now, and is JavaScript not TypeScript.

## ⚙️ Integrations

- [Stoplight Studio](https://stoplight.io/studio?utm_source=github&utm_medium=spectral&utm_campaign=readme) uses Spectral to validate and lint OpenAPI documents.
- [Spectral GitHub Action](https://github.com/stoplightio/spectral-action), lints documents in your repo, built by [Vincenzo Chianese](https://github.com/XVincentX/).
- [VS Code Spectral](https://github.com/stoplightio/vscode-spectral), all the power of Spectral without leaving VS Code.

## 🏁 Help Others Utilize Spectral

If you're using Spectral for an interesting use case, create an issue with details on how you're using it. We'll add it to a list here. Spread the goodness 🎉

## 👏 Contributing

If you are interested in contributing to Spectral, check out [CONTRIBUTING.md](CONTRIBUTING.md).

## 🎉 Thanks

- [Mike Ralphson](https://github.com/MikeRalphson) for kicking off the Spectral CLI and his work on Speccy
- [Jamund Ferguson](https://github.com/xjamundx) for JUnit formatter
- [Sindre Sorhus](https://github.com/sindresorhus) for Stylish formatter
- [Ava Thorn](https://github.com/amthorn) for the Pretty formatter
- Julian Laval for HTML formatter
- [@nulltoken](https://github.com/nulltoken) for a whole bunch of amazing features

## 📜 License

Spectral is 100% free and open-source, under [Apache License 2.0](LICENSE).

## 🌲 Sponsor Spectral by Planting a Tree

If you would like to thank us for creating Spectral, we ask that you [**buy the world a tree**][stoplight_forest].

[stoplight_forest]: https://ecologi.com/stoplightinc
