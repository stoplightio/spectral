# Continuous Integration

Spectral CLI can be run anywhere that NPM packages can be installed and run via CLI, which these days is pretty much any CI solution going.

Here are some examples of Spectral in various CI solutions to give you an idea.

## CircleCI

Users of CircleCI can take this entire file and save it as `.circleci/config.yml`, or move the `lint` job into their existing config.

```yaml
version: 2.1

orbs:
  node: circleci/node@4.1

jobs:
  lint:
    docker:
      - image: cimg/node:15.1
    steps:
      # Checkout the code as the first step.
      - checkout
      # Create a folder for results to live in
      - run: "[ -d lint-results ] || mkdir lint-results"
      - run:
          name: Run Spectral Lint
          command: npx @stoplight/spectral-cli lint openapi.yaml
            -o lint-results/junit.xml
            -f junit
      - store_test_results:
          path: lint-results

workflows:
  sample:
    jobs:
      - lint
```

Change the `openapi.yaml` to point to whatever documents you want to lint, and use -f (format) to pick the JUnit output format. This is a standard test format that many CI servers understand, and means you should be able to see the errors in the Test interface.

![On the CircleCI build results page there is a tab called Tests, which will show Spectral results so long as the junit format has been enabled](../img/ci-circleci.png)

Learn more about [CircleCI Configuration](https://circleci.com/docs/2.0/config-intro/), or take a look at this [demo repository](https://github.com/philsturgeon/spectral-demo-circleci).

## GitHub Action

Spectral has a pre-built [Spectral GitHub Action](https://github.com/stoplightio/spectral-action) which should speed up implementing Spectral in your GitHub repository.

## GitLab

GitLab users can add the following to their `.gitlab-ci.yml` files:

```yaml
stages:
  - lint

lint:spectral:
  stage: lint
  image:
    name: stoplight/spectral
    entrypoint: [""]
  script:
    - spectral lint -D -f junit -o spectral-report.xml openapi.yaml
  artifacts:
    when: always
    expire_in: 2 weeks
    reports:
      junit: $CI_PROJECT_DIR/spectral-report.xml
```

Note that this CI job exposes Spectral results on the merge request page, along with any other test output you may have. To ensure that GitLab can parse the output of spectral, we use the `-f junit`flag.

You will also need to edit your `openapi.yaml` file to point to the particular documents you want to lint.

## Jenkins

Instructions coming soon...
