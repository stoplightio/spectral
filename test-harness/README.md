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
lint --foo {document} --bar
====stdout====
expected output
====stderr====
optional/alternative to stdout for expected errors
```

### A real example?

```
====test====
Hello
====document====
openapi: 3.0.2
paths:
  /todos:
    get:
      responses:
        200:
          description: Get Todo Items
          content:
            'application/json':
              example: hello
====command====
lint {document} | grep "something"
====stdout====
 2:6  warning  some-rule  This rule is complaining about something.
```

#### Things to keep in mind when creating the files:

* 1 test per file, we do not support multiple splitting.
* Be precise with the separators. They should be 4 *before* **AND** *after* the word. `====`
* The 4 keywords are `test,spec,server,command,expect,expect-loose`, nothing else at the moment
* You can run all the tests on the same port `4010`, but you can also choose another one
* The `curl` command does not support piping stuff into other tools; so if you're trying to be cool and do `curl | grep`, well maybe next time.
* All the `curl` commands **must** have the `-i` flag, otherwise the trace parser won't understand the output

## Technical details

* A RegExp is used to split the content
* A temporary file with the document is stored on your disk
* Spectral gets spawned with the specified arguments and output is matched
* `{document}` can be used in command, stdout or stderr, and is replaced with the full file path
