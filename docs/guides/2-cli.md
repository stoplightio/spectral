# Spectral CLI

The Spectral CLI supports loading documents as YAML or JSON, and validation of OpenAPI v2/v3 documents via our built-in ruleset.

Options include:

```text
      --version                  Show version number                                                                       [boolean]
      --help                     Show help                                                                                 [boolean]
  -e, --encoding                 text encoding to use
                      [string] [choices: "utf8", "ascii", "utf-8", "utf16le", "ucs2", "ucs-2", "base64", "latin1"] [default: "utf8"]
  -f, --format                   formatter to use for outputting results
                           [string] [choices: "json", "stylish", "junit", "html", "text", "teamcity", "pretty"] [default: "stylish"]
  -o, --output                   output to a file instead of stdout                                                         [string]
      --stdin-filepath           path to a file to pretend that stdin comes from                                            [string]
      --resolver                 path to custom json-ref-resolver instance                                                  [string]
  -r, --ruleset                  path/URL to a ruleset file                                                                 [string]
  -F, --fail-severity            results of this level or above will trigger a failure exit code
                                                              [string] [choices: "error", "warn", "info", "hint"] [default: "error"]
  -D, --display-only-failures    only output results equal to or greater than --fail-severity             [boolean] [default: false]
      --ignore-unknown-format    do not warn about unmatched formats                                      [boolean] [default: false]
      --fail-on-unmatched-globs  fail on unmatched glob patterns                                          [boolean] [default: false]
  -v, --verbose                  increase verbosity                                                                        [boolean]
  -q, --quiet                    no logging - output only                                                                  [boolean]
```

## Error Results

Spectral has a few different error severities: `error`, `warn`, `info` and `hint`, and they are in "order" from highest to lowest. By default, all results will be shown regardless of severity, but since v5.0, only the presence of errors will cause a failure status code of 1. Seeing results and getting a failure code for it are now two different things.

The default behavior can be modified with the `--fail-severity=` option. Setting fail severity to `--fail-severity=info` would return a failure status code of 1 for any info results or higher. Using `--fail-severity=warn` will cause a failure status code for errors or warnings.

Changing the fail severity will not affect output. To change what results Spectral CLI prints to the screen, add the `--display-only-failures` switch (or just `-D` for short). This will strip out any results which are below the specified fail severity.

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

You can learn more about `$ref` resolving in the [JS section](./3-javascript.md#using-a-custom-resolver).
