# How to contribute to Spectral

First of all, thanks for considering contributing to Spectral! ✨ It's people like you that make tools like Spectral awesome. 💖

At Stoplight, we want contributing to Spectral to be an enjoyable and educational experience for everyone. Contributions go beyond commits in pull requests. We are excited to receive contributions in the form of feature ideas, pull requests, triaging issues, reviewing pull requests, implementations of Spectral in your own projects, blog posts, talks referencing the project, tweets, and much more!

Basically, if it is related to Spectral, we consider it a contribution.

## Stoplight Community Code of Conduct

The Stoplight Community is dedicated to providing a safe, inclusive, welcoming, and harassment-free space and experience for all community participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers.

Our Code of Conduct exists because of that dedication, and we do not tolerate harassment in any form. See our reporting guidelines [here](https://github.com/stoplightio/code-of-conduct/blob/master/incident-reporting.md). Our full Code of Conduct can be found at this [link](https://github.com/stoplightio/code-of-conduct/blob/master/long-form-code-of-conduct.md#long-form-code-of-conduct).

## Development

### Setup

- Install Node.JS, the minimum version we support is 12.20. If you have [nvm](https://github.com/nvm-sh/nvm) installed, execute `nvm use` and it'll pick the right version for you.
- [Yarn](https://yarnpkg.com/getting-started/install) - Yarn is a package manager for your code, similar to npm. While you can use npm to use Spectral in your own project, we use yarn for development of Spectral.
- IDE / Editor of your choice - I use WebStorm, but VSCode and many others are fine too.

#### Contributing from a Windows based environment

Spectral is a cross-platform tool and we do our best to ensure it honors specifics
of the underlying operating system it's being run on.

From a contributing standpoint, we also aim to make it easier for everyone to help
move the product forward. This section is dedicated to people that primarily work
on a Windows based environment.

The recommended IDE to contribute to Spectral is **[VisualStudio Code](https://code.visualstudio.com/)** (aka. vscode).

The repository is configured to checkout files using LF as line ending terminators and vscode honors this just fine.

Upon opening Spectral folder under vscode, some workspace recommended extensions will be proposed to be installed.
Please accept and install them as they will make your contributing journey nicer.

- **[EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)**: Applies some minor file normalization when saving files
- **[Jest runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner)**: Provides you with easy way to troubleshoot and debug failing tests
- **[Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)**: Makes it easy to locally test and tweak your code in a Linux container based development environment.

Most of the time, working natively from vscode will work fine. However, it may happen that the CI cringes because a test fails when ran in a Linux context. The repository contains a ready to use pre-configured Linux based development container for that exact purpose. Activate the vscode Command Palette (`Ctrl + Shift + P`), type `>reopen co` and select `Remote-Containers: Reopen in Container`. Bam! You're now in a Linux environment. And you terminal is now a native `bash`.

Would you want to switch back to the standard experience, using the Command Palette, type `>reopen lo` and select `Remote-Containers: Reopen locally`. Welcome back to the Windows world!

## Repo overview

This repo is a monorepo.

- packages/cli contains everything that's related to CLI of Spectral. This is the only package that's meant to be run exclusively in Node.js environment.
- packages/core contains all the code that's supposed to parse the input, load & validate the ruleset, run $ref resolver, run the linting process, process errors, etc. It's the heart of Spectral.
- packages/formats is all about formats, as the title says :). It comes up with a set of officially supported formats you can leverage in your rulesets.
- packages/functions is a collection of functions maintained by us that you can make use of in your rulesets.
- packages/parsers is mostly used internally by packages/core. Our parsers live there. Do note that we mostly integrate `@stoplight/yaml` & `@stoplight/json` there.
- packages/ref-resolver exposes an instance of json-ref-resolver
- packages/ruleset-migrator
- packages/rulesets is an array of rulesets backed by us. Currently the list of rulesets consists of OAS and AsyncAPI v2.
- packages/runtime is a set of utilities you can use in your own custom functions.

### General Principles

Since Spectral should be executable in a variety of environments, including browsers & Node.js, we strongly encourage to write code that's portable.
This implies usage of packages that are not platform-specific, browser globals such as fetch, as well as Node.js modules, such as `fs` or `path`.
The only exception is the CLI package that's supposed to be exclusive to Node.js.
To make the whole process easier, we usually have equivalent packages or approaches.
For instance, `path` can be quite safely replaced with `@stoplight/path`.

### Linting

In comparison with other Stoplight projects, Spectral is the strictest and enforces plenty of rules.
We use a number of various linters, including ESLint, Prettier or [kacl](https://www.npmjs.com/package/@brightcove/kacl).
If you're confused about a given linting error, please refer to the documentation provided by the owner of one of these packages, or plugins we use.
Commit messages follow [conventional-changelog](https://github.com/conventional-changelog/commitlint).

Running all linters:

```bash
yarn lint
```

Linting CHANGELOG.md

```bash
yarn lint.changelog
```

Linting TS/JS Code

```bash
yarn lint.eslint
```

Linting Documentation / Markdown files

```bash
yarn lint.prettier
```

### Tests

We run tests in the two environments that Spectral supports - the browser, and Node.js. Browser tests are run in a headless Chrome browser via the Karma test runner, while Node.js tests are run via the Jest test runner.

Tests should usually be written for both environments, but there are valid cases when you need to write separate tests for each test runner.
To do so, just create a file with `*.karma.test.ts` suffix or `*.jest.test.ts`. A good example of Jest only tests are the tests covering Spectral's CLI functionality - something that obviously is not relevant to the browser context.

#### Caveats

Since Jest and Jasmine (we use Jasmine framework in Karma) are not fully compatible, one has to keep in mind that certain assertions or methods are not available.
For example, `toMatchSnapshot` or `toMatchInlineSnapshot` are not available for use. `jest.mock` and similar are also missing.
This is usually not a problem. Things like `fs` are usually mocked globally (we use aliases to accomplish this), thus you don't need to worry too much.
If you need to setup HTTP mocks or populate FS with some data, we have a dedicated util to do so.

Example:

```ts
import { serveAssets } from '@stoplight/spectral-test-utils';
import * as path from '@stoplight/path';

const cwd = '/tmp/some-fake-path';

serveAssets({
  'https://library.com/defs.json': { // all requests for given resource will be mocked
    components: {
      schemas: {
        ExternalHttp: {
          type: 'number',
        },
      },
    },
  },
  [path.join(cwd, 'file.json')]: { // fs.read will return this
    openapi: '3.1.0',
    info: {
      title: 'Test file',
    },
    paths: {},
  },
})
```

This works both in Karma & Jest.

#### Usage

Running all tests:

```bash
yarn test
```

Running Node.js (jest) tests:

```bash
yarn test.jest
```

Running Browser (karma) tests:

```bash
yarn test.karma
```

Running the harness tests (these must pass or the PR merge will be blocked):

```bash
# make sure to build the code beforehand if you haven't done it. To do so execute yarn build && yarn workspace @stoplight/spectral-cli build.binary
yarn test.harness
```

## PR Submission

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your computer.
2. Install yarn: Refer to the [installation documentation](https://classic.yarnpkg.com/en/docs/install/) according to your development operating system
3. In your terminal, navigate to the directory you cloned Spectral into (check that you are on the `develop` branch).
4. Install the dependencies: `yarn`
5. Build Spectral: `yarn build && yarn bui`
6. Run Spectral from your local installation: `yarn cli lint [openapi_spec_file]`
7. Create a new branch for your work: `git checkout -b [name_of_your_new_branch]`
8. Make changes, add tests, and then run the tests: `yarn test` and `yarn test.harness`
9. Update the documentation if appropriate. For example, if you added a new rule to an OpenAPI ruleset,
   add a description of the rule in `docs/reference/openapi-rules.md`.

Now, you are ready to commit & push your changes, and make a pull request to the Spectral repo! 😃

If this is your first Pull Request on GitHub, here's some [help](https://egghead.io/lessons/javascript-how-to-create-a-pull-request-on-github).

> We try to respond to all pull requests and issues within 7 days. We welcome feedback from everyone involved in the project in open pull requests.

## Bugs & Feature Requests

We want to keep issues in this repo focused on bug reports and feature requests.

Before you open an issue, please search to see if anyone else has already opened an issue that might be similar to yours.

## Support

For help, discussions, or "how-to" type questions, please use [GitHub Discussions](https://github.com/stoplightio/spectral/discussions). If you are unsure if you are experiencing a bug then this is also a great place to start, as a discussion can be turned into an issue easily.

If you have found a security issue, please email [security@stoplight.io](mailto:security@stoplight.io) directly.
