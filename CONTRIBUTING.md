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
2. Install yarn: `npm install -g yarn`
3. In your terminal, navigate to the directory you cloned Spectral into (check that you are on the `develop` branch).
4. Install the dependencies: `yarn`
5. Build Spectral: `yarn build`
6. Run Spectral from your local installation: `node dist/cli/index.js lint [openapi_spec_file]`
7. Create a new branch for your work: `git checkout -b [name_of_your_new_branch]`
8. Make changes, add tests, and then run the tests: `yarn test.prod`

Now, you are ready to commit & push your changes, and make a pull request to the Spectral repo! 😃

If this is your first Pull Request on GitHub, here's some [help](https://egghead.io/lessons/javascript-how-to-create-a-pull-request-on-github). 

> We try to respond to all pull requests and issues within 7 days. We welcome feedback from everyone involved in the project in open pull requests. 

## To run tests

We run tests in the two envirnoments that Spectral supports - the browser, and node.js. Browser tests are run in a headless Chrome browser via the Karma test runner, while node.js tests are run via the Jest test runner.

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

## Creating an issue

We want to keep issues in this repo focused on bug reports and feature requests. 

For support questions, please use the [Stoplight Community forum](https://community.stoplight.io/c/open-source). If you are unsure if you are experiencing a bug, the [forum](https://community.stoplight.io/c/open-source) is a great place to start.

Before you open an issue, please search to see if anyone else has already opened an issue that might be similar to yours.

## Support

For support or "how-to" type questions, please use the [Stoplight Community forum](https://community.stoplight.io/c/open-source). If you are unsure if you are experiencing a bug, the [forum](https://community.stoplight.io/c/open-source) is a great place to start.

If you have found a security issue, please email [security@stoplight.io](mailto:security@stoplight.io) directly.

We try to respond to all pull requests and issues within 7 days.
