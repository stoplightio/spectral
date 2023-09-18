# Spectral CLI

[Once Spectral is installed](../getting-started/2-installation.md) and [you have a ruleset](../../README.md#installation-and-usage), run Spectral via the command-line:

```bash
spectral lint petstore.yaml
```

Use this command to lint with a custom ruleset or one that's located in a different directory than your API document:

```bash
spectral lint petstore.yaml --ruleset myruleset.json
```

You can lint multiple files at the same time by passing on multiple arguments:

```bash
spectral lint petstore.yaml https://example.com/petstore/openapi-v2.json https://example.com/todos/openapi-v3.json
```

Alternatively, you can use [glob syntax](https://github.com/mrmlnc/fast-glob#basic-syntax) to match multiple files at once:

```bash
spectral lint ./reference/**/*.oas*.{json,yml,yaml}
```

Other options include:

```
      --version                  Show version number                                                           [boolean]
      --help                     Show help                                                                     [boolean]
  -e, --encoding                 text encoding to use
          [string] [choices: "utf8", "ascii", "utf-8", "utf16le", "ucs2", "ucs-2", "base64", "latin1"] [default: "utf8"]
  -f, --format                   formatters to use for outputting results, more than one can be given joining them with
                                 a comma
        [string] [choices: "json", "stylish", "junit", "html", "text", "teamcity", "pretty", "github-actions", "sarif"]
                                                                                                    [default: "stylish"]
  -o, --output                   where to output results, can be a single file name, multiple "output.<format>" or
                                 missing to print to stdout                                                     [string]
      --stdin-filepath           path to a file to pretend that stdin comes from                                [string]
      --resolver                 path to custom json-ref-resolver instance                                      [string]
  -r, --ruleset                  path/URL to a ruleset file                                                     [string]
  -F, --fail-severity            results of this level or above will trigger a failure exit code
                                                  [string] [choices: "error", "warn", "info", "hint"] [default: "error"]
  -D, --display-only-failures    only output results equal to or greater than --fail-severity [boolean] [default: false]
      --ignore-unknown-format    do not warn about unmatched formats                          [boolean] [default: false]
      --fail-on-unmatched-globs  fail on unmatched glob patterns                              [boolean] [default: false]
  -v, --verbose                  increase verbosity                                                            [boolean]
  -q, --quiet                    no logging - output only                                                      [boolean]
```

The Spectral CLI supports loading documents as YAML or JSON, and validation of OpenAPI v2/v3 documents via the built-in ruleset.

## Using a Ruleset File

If you don't specify a ruleset file with the `--ruleset` parameter, the Spectral CLI looks for a ruleset file called `.spectral.yml`, `.spectral.yaml`, `.spectral.json` or `.spectral.js` in the current working directory.
Spectral won't lint the document if no ruleset is specified and no default ruleset file is found.

Here you can build a [custom ruleset](../getting-started/3-rulesets.md), or extend and modify the core rulesets:

- [OpenAPI ruleset](../reference/openapi-rules.md)
- [AsyncAPI ruleset](../reference/asyncapi-rules.md)

> If you use rules created or updated in a hosted [Stoplight API project](https://docs.stoplight.io/docs/platform/branches/pam-716-updated-landing-page/c433d678d027a-create-rules) with the Spectral CLI, you must publish the project from Stoplight before rule updates are used for linting.

## Error Results

Spectral has a few different error severities: `error`, `warn`, `info`, and `hint`, and they're in order from highest to lowest. By default, all results are shown regardless of severity, but since v5.0, only the presence of errors causes a failure status code of 1. Seeing results and getting a failure code for it are now two different things.

The default behavior can be modified with the `--fail-severity=` option. Setting fail severity to `--fail-severity=info` returns a failure status code of 1 for any info results or higher. Using `--fail-severity=warn` causes a failure status code for errors or warnings.

Changing the fail severity wont' affect output. To change the results Spectral CLI prints to the screen, add the `--display-only-failures` switch (or just `-D` for short). This removes any results which are below the specified fail severity.

## Formatters

### JSON Formatter

Spectral's JSON formatter outputs the results of a Spectral analysis in a JSON format that is easily parsable and human-readable. The output can be used to programmatically access and process the results of the analysis. You can enable this by adding `-f json --quiet` to the cli command.

Here's the schema for the output:

<!--
type: tab
title: Schema
-->

```yaml json_schema
type: array
items:
  type: object
  properties:
    code:
      type: string
      description: A string that represents the rule code that has been violated or triggered in Spectral. This code is unique to each rule defined in Spectral.
    path:
      type: array
      description: An array of strings that indicate the location within the analyzed document where the rule was triggered. It shows the "path" in the document structure to the issue.
      items:
        type: string
    message:
      type: string
      description: A string that contains a human-readable message describing the issue found by Spectral. This message typically provides information on why the rule was triggered and how to fix the issue.
    severity:
      enum:
        - 0
        - 1
        - 2
        - 3
      description: An integer representing the severity level of the rule violation. The severity levels usually follow a specific scale defined by Spectral. 0 equals error, while 3 is hint.
    range:
      type: object
      description: An object that describes where in the file the issue was found. It contains two sub-properties, start and end, each of which is an object with line and character properties. line and character are integers that represent the line number and the character position within the line, respectively, where the issue starts or ends. All the values are zero indexed.
      properties:
        start:
          type: object
          properties:
            line:
              type: integer
              minimum: 0
            character:
              type: integer
              minimum: 0
          required:
            - line
            - character
        end:
          type: object
          properties:
            line:
              type: integer
              minimum: 0
            character:
              type: integer
              minimum: 0
          required:
            - line
            - character
    source:
      type: string
      description: A string that contains the file path of the document that was analyzed by Spectral. It points to the source of the issue.
  required:
    - code
    - path
    - message
    - severity
    - range
    - source
```

<!--
type: tab
title: Example
-->

```json
[
  {
    "code": "invalid-response",
    "path": ["paths", "/users/{id}", "get", "responses", "200"],
    "message": "The '200' response should include a schema definition.",
    "severity": 2,
    "range": {
      "start": {
        "line": 32,
        "character": 12
      },
      "end": {
        "line": 35,
        "character": 14
      }
    },
    "source": "/Users/johndoe/projects/api-definition/openapi.yaml"
  }
]
```

<!-- type: tab-end -->

## Proxying

To have requests made from Spectral be proxied through a server, you'd need to specify the `PROXY` environment variable:

`PROXY=<<PROXY_SERVER_ADDRESS>> spectral lint spec.yaml`

## Custom \$ref Resolving

To customize $ref resolving, use the `--resolver` flag and pass a path to the JS file exporting a custom instance of json-ref-resolver Resolver.

### Example

Assuming the filename is called `my-resolver.js` and the content looks as follows, the path should look like: `--resolver=./my-resolver.js`.

```js
const { Resolver } = require("@stoplight/json-ref-resolver");

module.exports = new Resolver({
  resolvers: {
    // pass any resolver for the protocol you need
  },
});
```

You can learn more about `$ref` resolving in the [JS section](./3-javascript.md#using-a-custom-resolver).
