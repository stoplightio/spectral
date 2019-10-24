# Spectral CLI

Once installed, Spectral can be run via the command-line:

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

``` text
  --version                    Show version number                                          [boolean]
  --help                       Show help                                                    [boolean]
  --encoding, -e               text encoding to use                        [string] [default: "utf8"]
  --format, -f                 formatter to use for outputting results  [string] [default: "stylish"]
  --output, -o                 output to a file instead of stdout                            [string]
  --ruleset, -r                path/URL to a ruleset file                                    [string]
  --skip-rule, -s              ignore certain rules if they are causing trouble              [string]
  --fail-severity, -F          results of this level or above will trigger a failure exit code
                                [string] [choices: "error", "warn", "info", "hint"] [default: "warn"]
  --display-only-failures, -D  only output results equal to or greater than --fail-severity
                                                                           [boolean] [default: false]
  --verbose, -v                increase verbosity                                           [boolean]
  --quiet, -q                  no logging - output only                                     [boolean]
```

The Spectral CLI supports loading documents as YAML or JSON, and validation of OpenAPI v2/v3 documents via our built-in ruleset. 

You can also provide your own ruleset file. By default, the Spectral CLI will look for a ruleset file called `.spectral.yml` or `.spectral.json` in the current working directory. You can tell spectral to use a different file by using the `--ruleset` CLI option.

Here you can build a [custom ruleset](../getting-started/rulesets.md), or extend and modify our [core OpenAPI ruleset](https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md).

## Error Results

Spectral has a few different error severities: `error`, `warn`, `info` and `hint`, and they are in "order" from highest to lowest. By default, all results will be shown regardless of severity, but since v5.0, only the presence of warnings or errors will cause a failure status code of 1.

The default behavior can be modified with the `--fail-severity=` option. Setting fail severity to `--fail-severity=info` would return a failure status code of 1 for any info results or higher. Using `--fail-severity=error` will only cause a failure status code for errors.

Changing the fail severity will not effect output. To change what results Spectral CLI prints to the screen, add the `--display-only-failures` switch (or just `-D` for short). This will strip out any results which are below the specified fail severity.

## Proxying

To have requests made from Spectral be proxied through a server, you'd need to specify PROXY environment variable:

`PROXY=<<PROXY_SERVER_ADDRESS>> spectral lint spec.yaml`
