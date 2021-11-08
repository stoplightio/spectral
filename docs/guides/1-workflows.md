# Workflows

## Linting Design-First Workflows

If you are using Studio, Spectral automatically runs as you work so you never need to switch to the CLI.

Seeing these errors and warnings facilitate consistent APIs, quickly and easily, without requiring "OpenAPI Gatekeepers" to manually enforce the rules.

## Linting Code-First Workflows

Using Spectral gets a little tricky for developers who are following a code-first (a.k.a "design-second") workflow. If the API description documents live in YAML or JSON files, the design-first workflow can be used, with new changes being linted.

If the API description documents live in some other format, such as comments or annotations inside code, consider using a tool with an export option on the CLI. Here's an example using [go-swagger](https://github.com/go-swagger/go-swagger).

```bash
swagger generate spec -o ./tmp/openapi.json && spectral lint ./tmp/openapi.json
```

By the time you've written your code, if Spectral points anything out related to your actual API, and not providing feedback on the API description document itself, figuring out what to do next might be troublesome.

For example if the API has a bunch of URLs with underscores, then becoming consistent is either a case of waiting for the next major version and changing things in there, or taking a more evolution-based approach, aliasing `/example_url` to `/example-url`, then look into [deprecating the old URL](https://apisyouwonthate.com/blog/api-evolution-for-rest-http-apis/).

## Git-hooks

Git commit hooks prevent developers form committing broken or low quality documents. Here's a simple solution using [Husky](https://github.com/typicode/husky).

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
