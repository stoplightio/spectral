# Workflows

When and where should you use Spectral? It depends a lot how you are creating and managing your API description documents, or whatever files you are trying to lint.

1. Run [Spectral CLI](2-cli.md) against design docs and get feedback very early on.
2. Run Spectral in [Stoplight Studio](https://stoplight.io/studio/) or [VS Code](https://github.com/stoplightio/vscode-spectral) as you work to avoid switching to CLI.
3. Run Spectral as a [Git hook](#Git-hooks) for quick feedback in case people forget to run it in the CLI.
4. Use [Continuous Integration](#Continuous-Integration) to reject pull requests that don't match your rulesets/style-guide.

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

```jsonc
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

Spectral can be used in any CI environment that runs run NodeJS or our Docker image: Jenkins, CircleCI, GitHub Actions, etc.

By enabling the JUnit output format when you lint, most CI servers will show visual results helping people realise what mistakes were made and where.

Read our [Continuous Integration guide](8-continuous-integration.md) for more information on setting things up in your CI of choice.
