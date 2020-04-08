# How to contribute to Spectral

First of all, thanks for considering contributing to Spectral! ✨ It's people like you that make tools like Spectral awesome. 💖

At Stoplight, we want contributing to Spectral to be an enjoyable and educational experience for everyone. Contributions go beyond commits in pull requests. We are excited to receive contributions in the form of feature ideas, pull requests, triaging issues, reviewing pull requests, implementations of Spectral in your own projects, blog posts, talks referencing the project, tweets, and much more!

Basically, if it is related to Spectral, we consider it a contribution.

## Stoplight Community Code of Conduct

The Stoplight Community is dedicated to providing a safe, inclusive, welcoming, and harassment-free space and experience for all community participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers.

Our Code of Conduct exists because of that dedication, and we do not tolerate harassment in any form. See our reporting guidelines [here](https://github.com/stoplightio/code-of-conduct/blob/master/incident-reporting.md). Our full Code of Conduct can be found at this [link](https://github.com/stoplightio/code-of-conduct/blob/master/long-form-code-of-conduct.md#long-form-code-of-conduct).

## Development

Yarn is a package manager for your code, similar to npm. While you can use npm to use Spectral in your own project, we use yarn for development of Spectral.

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your computer.
2. Install yarn: Refer to the [installation documentation](https://classic.yarnpkg.com/en/docs/install/) according to your developement operating system
3. In your terminal, navigate to the directory you cloned Spectral into (check that you are on the `develop` branch).
4. Install the dependencies: `yarn`
5. Build Spectral: `yarn build`
6. Run Spectral from your local installation: `yarn cli lint [openapi_spec_file]`
7. Create a new branch for your work: `git checkout -b [name_of_your_new_branch]`
8. Make changes, add tests, and then run the tests: `yarn test.prod` and `yarn test.harness`
9. Update the documentation if appropriate. For example, if you added a new rule to an OpenAPI ruleset,
add a description of the rule in `docs/reference/openapi-rules.md`.

Now, you are ready to commit & push your changes, and make a pull request to the Spectral repo! 😃

If this is your first Pull Request on GitHub, here's some [help](https://egghead.io/lessons/javascript-how-to-create-a-pull-request-on-github).

> We try to respond to all pull requests and issues within 7 days. We welcome feedback from everyone involved in the project in open pull requests.

### Contributing from a Windows based environment

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

## To run tests

We run tests in the two environments that Spectral supports - the browser, and node.js. Browser tests are run in a headless Chrome browser via the Karma test runner, while node.js tests are run via the Jest test runner.

Tests should usually be written for both environments, but there are valid cases when you need to write separate tests for each test runner. To do so, just create a file with `*.karma.test.ts` suffix or `*.jest.test.ts`. A good example of Jest only tests are the tests covering Spectral's CLI functionality - something that obviously is not relevant to the browser context.

Running all tests:

```bash
yarn test.prod
```

Running node.js (jest) tests:

```bash
yarn test
```

Running browser (karma) tests:

```bash
yarn test.karma
```

Running a specific test:

```bash
yarn test src/cli/commands/__tests__/lint.test.ts
```

Running the harness tests (these must pass or the PR merge will be blocked):

```bash
yarn test.harness
```

## Creating an issue

We want to keep issues in this repo focused on bug reports and feature requests.

For support questions, please use the [Stoplight Community forum](https://community.stoplight.io/c/open-source). If you are unsure if you are experiencing a bug, the [forum](https://community.stoplight.io/c/open-source) is a great place to start.

Before you open an issue, please search to see if anyone else has already opened an issue that might be similar to yours.

## Support

For support or "how-to" type questions, please use the [Stoplight Community forum](https://community.stoplight.io/c/open-source). If you are unsure if you are experiencing a bug, the [forum](https://community.stoplight.io/c/open-source) is a great place to start.

If you have found a security issue, please email [security@stoplight.io](mailto:security@stoplight.io) directly.

We try to respond to all pull requests and issues within 7 days.
