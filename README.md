[![Demo of Spectral linting an OpenAPI document from the CLI](./docs/img/readme-header.svg)](https://stoplight.io/api-governance?utm_source=github&utm_medium=spectral&utm_campaign=readme)
[![CircleCI](https://img.shields.io/circleci/build/github/stoplightio/spectral/develop)](https://circleci.com/gh/stoplightio/spectral) [![NPM Downloads](https://img.shields.io/npm/dw/@stoplight/spectral-core?color=blue)](https://www.npmjs.com/package/@stoplight/spectral-core) [![Stoplight Forest](https://img.shields.io/ecologi/trees/stoplightinc)][stoplight_forest]

- **Custom Rulesets**: Create custom rules to lint JSON or YAML objects
- **Ready-to-use Rulesets**: Validate and lint **OpenAPI v2 & v3.x** and **AsyncAPI** Documents
- **API Style Guides**: Automated [API Style Guides](https://stoplight.io/api-style-guides-guidelines-and-best-practices?utm_source=github&utm_medium=spectral&utm_campaign=readme) using rulesets improve consistency across all your APIs
- **Ready-to-use Functions**: Built-in set of functions to help [create custom rules](https://meta.stoplight.io/docs/spectral/e5b9616d6d50c-custom-rulesets#adding-rules). Functions include pattern checks, parameter checks, alphabetical ordering, a specified number of characters, provided keys are present in an object, etc.
- **Custom Functions**: Create custom functions for advanced use cases

# Overview

- [🧰 Installation](#-installation)
- [💻 Usage](#-usage)
- [📖 Documentation](#-documentation)
- [ℹ️ Support](#ℹ️-support)
- [🌎 Real-World Rulesets](#-real-world-rulesets)
- [⚙️ Integrations](#️-integrations)
- [👏 Contributing](#-contributing)
- [🌲 Sponsor Spectral by Planting a Tree](#-sponsor-spectral-by-planting-a-tree)

## 🧰 Installation

The easiest way to install spectral is to use either [npm](https://www.npmjs.com/):

```bash
npm install -g @stoplight/spectral-cli
```

Or [yarn](https://yarnpkg.com/):

```
yarn global add @stoplight/spectral-cli
```

You can find more installation methods [here](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mw-installation).

## 💻 Usage

### 1. Create a local ruleset

Spectral, being a generic YAML/JSON linter, **needs a ruleset** to lint files. A ruleset is a JSON, YAML, or JavaScript/TypeScript file (often the file will be called `.spectral.yaml` for a YAML ruleset) that contains a collection of rules, which can be used to lint other JSON or YAML files such as an API description.

To get started, run this command in your terminal to create a `.spectral.yaml` file that will use Spectral's predefined rulesets based on OpenAPI or AsyncAPI:

```bash
echo 'extends: ["spectral:oas", "spectral:asyncapi"]' > .spectral.yaml
```

If you would like to create your own rules, check out the [Custom Rulesets](https://meta.stoplight.io/docs/spectral/01baf06bdd05a-rulesets) page.

### 2. Lint

Use this command if you have a ruleset file in the same directory as the documents you are linting:

```bash
spectral lint myapifile.yaml
```

Use this command to lint with a custom ruleset, or one that's located in a different directory than the documents being linted:

```bash
spectral lint myapifile.yaml --ruleset myruleset.yaml
```

## 📖 Documentation

- [Documentation](https://meta.stoplight.io/docs/spectral/docs/getting-started/1-concepts.md)
  - [Getting Started](https://meta.stoplight.io/docs/spectral/docs/getting-started/1-concepts.md) - The basics of Spectral.
  - [Rulesets](https://meta.stoplight.io/docs/spectral/01baf06bdd05a-rulesets) - Understand the structure of a ruleset so you can tweak and make your own rules.

Once you've had a look through the getting started material, some of these guides can help you become a power user.

- [Different Workflows](https://meta.stoplight.io/docs/spectral/docs/guides/1-workflows.md) - When and where should you use Spectral? Editors, Git-hooks, Continuous Integration, GitHub Actions, wherever you like!
- [Using the command-line interface](https://meta.stoplight.io/docs/spectral/docs/guides/2-cli.md) - Quickest way to get going with Spectral is in the CLI.
- [Using the JavaScript API](https://meta.stoplight.io/docs/spectral/docs/guides/3-javascript.md) - Access the _raw power_ of Spectral via the JS, or hey, TypeScript if you want.
- [Custom Rulesets](https://meta.stoplight.io/docs/spectral/docs/guides/4-custom-rulesets.md) - Need something more than the core rulesets provide? Fancy building your own API Style Guide? Learn how to create a custom ruleset.
- [Custom Functions](https://meta.stoplight.io/docs/spectral/docs/guides/5-custom-functions.md) - Handle more advanced rules, by writing a little JavaScript/TypeScript and calling it as a function.

## ℹ️ Support

If you need help using Spectral or have any questions, please use [GitHub Discussions](https://github.com/stoplightio/spectral/discussions), or visit the [Stoplight Community Discord](https://discord.com/invite/stoplight). These communities are a great place to share your rulesets, or show off tools that leverage Spectral.

If you have a bug or feature request, please [create an issue](https://github.com/stoplightio/spectral/issues).

## 🌎 Real-World Rulesets

- [Adidas](https://github.com/adidas/api-guidelines/blob/master/.spectral.yml) - Adidas were one of the first companies to release their API Style Guide in a written guide _and_ a Spectral ruleset. Lots of good rules to try in here.
- [APIs You Won't Hate](https://github.com/apisyouwonthate/style-guide) - An opinionated collection of rules based on advice in the [APIs You Won't Hate](https://apisyouwonthate.com/) community.
- [Azure](https://github.com/Azure/azure-api-style-guide/blob/main/spectral.yaml) - Ruleset and complimentary style guide for creating OpenAPI 2 or 3 definitions of Azure services.
- [Box](https://github.com/box/box-openapi/blob/main/.spectral.yml) - Lots of [Custom Functions](https://meta.stoplight.io/docs/spectral/ZG9jOjI1MTkw-custom-functions) being used to enforce good practices that the Box API governance folks are interested in.
- [DigitalOcean](https://github.com/digitalocean/openapi/blob/main/spectral/ruleset.yml) - Keeping their OpenAPI nice and tidy, enforcing use of `$ref` (probably to minimize conflicts), naming conventions for Operation IDs, and all sorts of other handy OpenAPI tips.
- [Tranascom](https://github.com/transcom/mymove/blob/master/swagger-def/.spectral.yml) - Don't even think about using anything other than `application/json`.

Here are [more real-world examples](https://github.com/stoplightio/spectral-rulesets) of Spectral in action.

## ⚙️ Integrations

- [GitHub Action](https://github.com/stoplightio/spectral-action) - Lints documents in your repo, built by [Vincenzo Chianese](https://github.com/XVincentX/).
- [Jetbrains Plugin](https://plugins.jetbrains.com/plugin/18520-spectral) - Automatic linting of your OpenAPI specifications and highlighting in your editor.
- [Stoplight Studio](https://stoplight.io/studio?utm_source=github&utm_medium=spectral&utm_campaign=readme) - Uses Spectral to validate and lint OpenAPI documents.
- [VS Code Spectral Extension](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral) - All the power of Spectral without leaving VS Code.

## 🏁 Help Others Utilize Spectral

If you're using Spectral for an interesting use case, [contact us](mailto:growth@stoplight.io) for a case study. We'll add it to a list here. Spread the goodness 🎉

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
