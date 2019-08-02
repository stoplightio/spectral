# Spectral CLI

Once installed, Spectral can be run via the command-line:

```bash
spectral lint petstore.yaml
```

Other options include:

``` text
  -e, --encoding=encoding      text encoding to use
  -f, --format=json|stylish    formatter to use for outputting results
  -h, --help                   show CLI help
  -o, --output=output          output to a file instead of stdout
  -q, --quiet                  no logging - output only
  -r, --ruleset=ruleset        path to a ruleset file (supports remote files)
  -s, --skip-rule=skip-rule    ignore certain rules if they are causing trouble
  -v, --verbose                increase verbosity
```

> Note: The Spectral CLI supports both YAML and JSON.

Currently, Spectral CLI supports validation of OpenAPI documents and lints them based on our default ruleset, or you can create and use [your own rulesets](./rulesets.md).
