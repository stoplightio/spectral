# Lint 
After you've [installed](../getting-started/2-installation.md) Spectral and [loaded a ruleset](./3-load-ruleset.md), run Spectral from the command-line:

```bash
spectral lint petstore.yaml
```

You can lint multiple files at the same time by passing on multiple arguments:

```bash
spectral lint petstore.yaml https://example.com/petstore/openapi-v2.json https://example.com/todos/openapi-v3.json
```

Alternatively you can use [glob syntax](https://github.com/mrmlnc/fast-glob#basic-syntax) to match multiple files at once:

```bash
spectral lint ./reference/**/*.oas*.{json,yml,yaml}
```
See [Spectral CLI]( ../guides/2-cli.md) for more commands.