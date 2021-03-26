# Spectral CLI

[Once installed](../getting-started/2-installation.md), Spectral can be run via the command-line:

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

Other options include:

```text
  --version                    Show version number                                          [boolean]
  --help                       Show help                                                    [boolean]
  --encoding, -e               text encoding to use                        [string] [default: "utf8"]
  --format, -f                 formatter to use for outputting results
      [string] [choices: "json", "stylish", "junit", "html", "text", "teamcity"] [default: "stylish"]
  --output, -o                 output to a file instead of stdout                            [string]
  --resolver                   path to custom json-ref-resolver instance                     [string]
  --ruleset, -r                path/URL to a ruleset file                                    [string]
  --fail-severity, -F          results of this level or above will trigger a failure exit code
                               [string] [choices: "error", "warn", "info", "hint"] [default: "error"]
  --display-only-failures, -D  only output results equal to or greater than --fail-severity
                                                                           [boolean] [default: false]
  --ignore-unknown-format      do not warn about unmatched formats         [boolean] [default: false]
  --fail-on-unmatched-globs    fail on unmatched glob patterns             [boolean] [default: false]
  --verbose, -v                increase verbosity                                           [boolean]
  --quiet, -q                  no logging - output only                                     [boolean]
```

The Spectral CLI supports loading documents as YAML or JSON, and validation of OpenAPI v2/v3 documents via our built-in ruleset.

## Using a Ruleset File

If you don't specify a ruleset file with the `--ruleset` parameter, the Spectral CLI will look for a ruleset file called `.spectral.yml`, `.spectral.yaml`, or `.spectral.json` in the current working directory. If no ruleset is specified and no default ruleset file is found, the built-in rulesets will be used.

Here you can build a [custom ruleset](../getting-started/3-rulesets.md), or extend and modify our core rulesets:

- [OpenAPI ruleset](../reference/openapi-rules.md)
- [AsyncAPI ruleset](../reference/asyncapi-rules.md)

## Error Results

Spectral has a few different error severities: `error`, `warn`, `info` and `hint`, and they are in "order" from highest to lowest. By default, all results will be shown regardless of severity, but since v5.0, only the presence of errors will cause a failure status code of 1. Seeing results and getting a failure code for it are now two different things.

The default behavior can be modified with the `--fail-severity=` option. Setting fail severity to `--fail-severity=info` would return a failure status code of 1 for any info results or higher. Using `--fail-severity=warn` will cause a failure status code for errors or warnings.

Changing the fail severity will not effect output. To change what results Spectral CLI prints to the screen, add the `--display-only-failures` switch (or just `-D` for short). This will strip out any results which are below the specified fail severity.

## Proxying

To have requests made from Spectral be proxied through a server, you'd need to specify PROXY environment variable:

`PROXY=<<PROXY_SERVER_ADDRESS>> spectral lint spec.yaml`

## Custom \$ref Resolving

If you want to customize \$ref resolving, you can leverage `--resolver` flag and pass a path to the JS file exporting a custom instance of json-ref-resolver Resolver.

### Example

Assuming the filename is called `my-resolver.js` and the content looks as follows, the path should look more or less like `--resolver=./my-resolver.js`.

```js
const { Resolver } = require("@stoplight/json-ref-resolver");

module.exports = new Resolver({
  resolvers: {
    // pass any resolver for protocol you need
  },
});
```

You can learn more about `$ref` resolving in the [JS section](./3-javascript.md#using-custom-resolver).
