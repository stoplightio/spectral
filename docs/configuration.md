# Configuring Spectral

## Example ruleset file

```yaml
rules:
    rule-name:
        given: $..parameters[*]
        then:
            field: description
            function: truthy        
```

## Rules

Rules are highly configurable. There are only few required parameters but the optional ones gives powerful flexibility.

TODO: replace TS interfaces with a nice (automaticaly generated) table.

```ts
export interface IRule<T = string, O = any> {
  type?: RuleType;

  // A short summary of the rule and its intended purpose
  summary?: string;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // The severity of results this rule generates
  severity?: DiagnosticSeverity;

  // Tags attached to the rule, which can be used for organizational purposes
  tags?: string[];

  // should the rule be enabled by default?
  enabled?: boolean;

  // Filter the target down to a subset[] with a JSON path
  given: string;

  when?: {
    // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
    // EXAMPLE: if the target object is an oas object and given = `$..responses[*]`, then `@key` would be the response code (200, 400, etc)
    field: string;

    // a regex pattern
    pattern?: string;
  };

  then: IThen<T, O> | Array<IThen<T, O>>;
}

export interface IThen<T, O> {
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  // EXAMPLE: if the target object is an oas object and given = `$..responses[*]`, then `@key` would be the response code (200, 400, etc)
  field?: string;

  // name of the function to run
  function: T;

  // Options passed to the function
  functionOptions?: O;
}
```

## Configuring rulesets via CLI

```bash
spectral lint foo.yaml --ruleset=path/to/ruleset.yaml
```

### Ruleset validation

We use JSON Schema & AJV to validate your rulesets file and help you spot issues early.

**Note for developers**

Supporting YAML and JSON file validation doesn't come free. 
We need to maintain schema files that mirror IRule and IRuleset types (see `/src/meta/*.schema.json`).
Ideally, we would have a script that converts TS type to JSON Schema and keeps the meta files up to date. As of now we have a helper that partially automates the work.

Invoke `yarn schema.update` to recreate the `/src/meta/rule.schema.json`.
**Warning**: make sure to update *generic* types. Current tools fails to recognize it properly and e.g. treats `string` as `object`.