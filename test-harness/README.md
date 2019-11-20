# Test Harness

## Prerequisites

* Install the project dependencies with `yarn`
* Generate the binary for your platform with `yarn build.binary`. This will *also* compile the project from TS -> JS

## Running the suite

Run `yarn test.harness` from your terminal

### Running a selected tests

You can run one or selected tests using `TESTS` env variable.
If you want multiple test files to be run separate them with commas.
Use paths relative to the `./scenarios` directory.

E.g. run `TESTS=parameters-ac1.oas2.scenario,validate-body-params/form-byte-format-fail.oas2.scenario yarn test.harness`

### Matching test files

All test files are matched using a glob `**/*.scenario`.
This means that you can:
- nest test files in subdirectories
- skip files by suffixing name with `.skip` or some other suffix.

## Adding a new test

* Create a new file in the `./scenarios` directory. It can have _any_ name and _any_ extension, it does not really matter.
* Use the following template and put your stuff:

```
====test====
Test text, can be multi line.
====document====
some JSON/YAML document
====command====
{bin} lint --foo {document} --bar
====stdout====
expected output
====stderr====
optional/alternative to stdout for expected errors
====status====
(optional) expected exit code (`0` or `1`)
```

### A real example?

```
====test====
scenario-example
====document====
openapi: 3.0.2
servers:
  - url: "localhost"
info:
  title: "my api"
  description: "An example"
  contact:
    name: "Stoplight"
  version: "1.0"
paths:
  /todos:
    get:
      tags:
        - "example"
      description: "Example endpoint"
      operationId: getTodos
      responses:
        200:
          description: Get Todo Items
          content:
            'application/json':
              example: hello
====command====
{bin} lint {document}
====stdout====
OpenAPI 3.x detected

{document}
 2:6  warning  some-rule  This rule is complaining about something.

✖ 1 problems (1 error, 0 warning, 0 infos, 0 hints)
```

#### Things to keep in mind when creating the files:

* 1 test per file, we do not support multiple splitting.
* Be precise with the separators. They should be 4 *before* **AND** *after* the word. `====`
* The keywords are `test`, `document`, `command`, `status`, `stdout`, and `stderr`, nothing else at the moment
* You can run all the tests on the same port `4010`, but you can also choose another one
* You can pipe your command to grep. For example, using `lint {document} | grep 'expected-rule-name'` can be used to test for the presence of a specific violation. But, beware of being overly specific here.

## Technical details

* A RegExp is used to split the content
* A temporary file with the document is stored on your disk
* Spectral gets spawned with the specified arguments and output is matched
* `{document}` can be used in command, stdout or stderr, and is replaced with the full file path
