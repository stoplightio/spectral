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

The Spectral CLI supports loading documents as YAML or JSON, and validation of OpenAPI v2/v3 documents via our built-in ruleset. 

Custom rulesets can be provided with `--ruleset`, but the default place Spectral CLI looks for a ruleset is in the current working directory for a file called `.spectral.yml`.

Here you can build a [custom ruleset](../getting-started/rulesets.md), or extend and modify our [core OpenAPI ruleset](https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md).
