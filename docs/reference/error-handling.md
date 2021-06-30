## Error Handling

### Rulesets

**WILL bail** when:

- the ruleset cannot be loaded for any reason, i.e. parsing error, i/o error, etc.
- the ruleset is not valid, i.e. contains some semantic errors, etc.
- the `functionOptions` validator is specified and the options are not valid
- a rule in the ruleset:
  - had an invalid `given`, i.e. the JSON Path expression is not valid from syntax's standpoint
- the ruleset contains `except` entries and the input is passed through stdin

### Runtime

**WILL bail** when:

- a _valid_ JSON Path expression throws any exception
- message interpolation fails
- a JSON Path alias cannot be resolved
- there was an exception while executing a custom function

**WILL report a diagnostic error or errors** when:

- document does not match any _registered_ format (can be suppressed with ignoreUnknownFormat). **WILL NOT report** if no format is registered.
- $ref resolving encounters issues

The severity **MUST** equal `DiagnosticSeverity.Error`.

### Custom Functions

**MUST bail** when:

- `functionOptions` is not valid

**WILL report a diagnostic error or errors** when:

- the input is invalid

The severity **MUST** equal `DiagnosticSeverity.Error`.
