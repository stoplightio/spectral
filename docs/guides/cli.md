# Spectral CLI

Once installed, Spectral can be run via the command-line:

```bash
spectral lint petstore.yaml
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
                                [string] [choices: "error", "warn", "info", "hint"] [default: "hint"]
  --display-only-failures, -D  only output results equal to or greater than --fail-severity
                                                                           [boolean] [default: false]
  --verbose, -v                increase verbosity                                           [boolean]
  --quiet, -q                  no logging - output only                                     [boolean]
```

> Note: The Spectral CLI supports both YAML and JSON.

Currently, Spectral CLI supports validation of OpenAPI v2/v3 documents via our built-in ruleset, or you can create [custom rulesets](../getting-started/rulesets.md) to work with any JSON/YAML documents.

## Error Results

Spectral has a few different error severities: `error`, `warn`, `info` and `hint`, and they are in "order" from highest to lowest. By default, all results will be shown regardless of severity, and the presence of any results will cause a failure status code of 1.

The default behavior is can be modified with the `--fail-severity=` option. Setting fail severity to `--fail-severity=warn` would return a status code of 1 for any warning results or higher, so that would also include error. Using `--fail-severity=error` will only show errors.

Changing the fail severity will not effect output. To change what results Spectral CLI prints to the screen, add the `--display-only-failures` switch (or just `-D` for short). This will strip out any results which are below the fail severity.
