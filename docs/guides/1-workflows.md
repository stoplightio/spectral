# Workflow

When and where should you use Spectral? It depends a lot how you are creating and managing your API description documents, but probably wherever they are being made.

- Run [Spectral CLI](2-cli.md) against design docs and get feedback very early on.
- Run Spectral in [Stoplight Studio](https://stoplight.io/studio/) automatically as you work, without switching to the CLI.

## Linting Design-First Workflows

If the developer is just in the early stages of planning and designing the API, they could run Spectral against their design docs and get feedback very early on. If they are using Studio, Spectral will be running automatically as they work, without the developer even needing to switch to the CLI.

Seeing these errors and warnings will help nudge the developer towards creating consistent APIs, quickly and easily, without needing to have "OpenAPI Gatekeepers" to enforce the rules manually. Those folks are not infallible, they can miss things, but Spectral can be used to free those people up for bigger and better things.

## Linting Code-First Workflows

Using Spectral gets a little tricky for developers who are following a code-first (a.k.a "design-second") workflow. If the API description documents live in YAML or JSON files then its fine, and the design-first workflow can be used: with new changes being linted.

If the API description documents live in some other format, maybe as comments or annotations inside code, Spectral has no way to read that. Hopefully that annotations-based tool has some sort of export option on the CLI. Here's an example for those using [go-swagger](https://github.com/go-swagger/go-swagger).

```bash
swagger generate spec -o ./tmp/openapi.json && spectral lint ./tmp/openapi.json
```

Sadly by the time you've already written your code, if Spectral points anything out related to your actual API, and not providing feedback on the API description document itself, figuring out what to do next might be troublesome.

For example if the API has a bunch of URLs with underscores, then becoming consistent is either a case of waiting for the next major version and changing things in there, or taking a more evolution-based approach, aliasing `/example_url` to `/example-url`, then look into [deprecating the old URL](https://apisyouwonthate.com/blog/api-evolution-for-rest-http-apis/).

## Git-hooks

Folks will forget to run Spectral, and that means they can commit broken or (low quality) documents. Adding a git commit hook can be a simple solution to this using something like [Husky](https://github.com/typicode/husky).

```
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "spectral lint ./reference/**/*.{json,yml,yaml}",
      "pre-push": "spectral lint ./reference/**/*.{json,yml,yaml}",
      "...": "..."
    }
  }
}
```

See our [CLI documentation](./2-cli.md) to see what other arguments and options can be used.

## Continuous Integration

Running Spectral on CI servers is just a case of doing what you'd do in the CI.

``` yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:12
    steps:
      - checkout
      - run:
          name: "API Description Linter"
          command: npx @stoplight/spectral lint somefile.yaml -- --ruleset=config/custom-ruleset.yaml
```

We plan to add JUnit/xUnit test results in a future version, so tools like CircleCI can show test results in a more visual way. For now, the commands exit code will alert CI that there was a problem, and the console output will say why.
