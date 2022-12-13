# Workflows

When and where you use Spectral depends on how you are creating and managing your API description documents or other files you are trying to lint.

You can:

1. Run [Spectral CLI](2-cli.md) against design docs and get early feedback.
2. Run Spectral in [Stoplight Studio](https://stoplight.io/studio/?utm_source=github&utm_medium=spectral&utm_campaign=docs) or [VS Code](https://github.com/stoplightio/vscode-spectral?utm_source=github&utm_medium=spectral&utm_campaign=docs) as you work to avoid switching to CLI.
3. Run Spectral as a [Git hook](#git-hooks) to enforce linting as part of the commit process.
4. Use [Continuous Integration](#continuous-integration) to reject pull requests that don't match your rulesets and style guide.

## Linting Design-First Workflows

If you are using [Stoplight Studio](https://stoplight.io/studio/?utm_source=github&utm_medium=spectral&utm_campaign=docs), Spectral automatically runs as you work so you never need to switch to the CLI.

Seeing these errors and warnings facilitate consistent APIs, quickly and easily, without requiring "OpenAPI Gatekeepers" to manually enforce the rules.

## Linting Code-First Workflows

Using Spectral gets a little tricky for developers who are following a code-first (a.k.a "design-second") workflow. If the API description documents live in YAML or JSON files, the design-first workflow can be used, with new changes being linted.

If the API description documents live in some other format, such as comments or annotations inside code, consider using a tool with an export option on the CLI. Here's an example using [go-swagger](https://github.com/go-swagger/go-swagger):

```bash
swagger generate spec -o ./tmp/openapi.json && spectral lint ./tmp/openapi.json
```

After your API is in production, changing problems that Spectral finds could be troublesome.

For example, if the API has a bunch of URLs with underscores, then becoming consistent is either a case of waiting for the next major version and changing things in there, or taking a more evolution-based approach, aliasing `/example_url` to `/example-url`, then look into [deprecating the old URL](https://apisyouwonthate.com/blog/api-evolution-for-rest-http-apis/).

## Git-hooks

[Git hooks](https://git-scm.com/docs/githooks) are programs or commands you can set up and have them run when you commit or push. They can help lint your commit messages, run tests, or even lint your API descriptions with Spectral.

Here's an example of a Spectral Git hook using [Husky](https://github.com/typicode/husky):

```json
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

See the [CLI documentation](./2-cli.md) to see what other arguments and options can be used.

## Continuous Integration

Spectral can be used in any CI environment that runs Node.js or a Docker image: Jenkins, CircleCI, GitHub Actions, etc.

By enabling the JUnit output format when you lint, most CI servers can show visual results helping people realize which mistakes were made and where.

Read the [Continuous Integration guide](8-continuous-integration.md) for more information on setting things up in your CI of choice.
