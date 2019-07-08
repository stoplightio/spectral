# Spectral Rulesets

Rulesets are a container for collections of rules. These rules are taking parameters, and calling functions on certain parts of the JSON object being linted.

## CLI Usage

When you run the `spectral lint my-document.json` CLI command, Spectral will automatically apply the built in OpenAPI v2 or v3 ruleset if appropriate.

To customize the rules that are applied, simply create a `spectral.yml` in the same directory that you are running the `spectral lint` command from and it will automatically be used.

## Ruleset Examples

Spectral currently support ruleset files in both `yaml` and `json` formats.

### Adding a rule

Add your own rules under the `rules` property in your `spectral.yml` ruleset file.

**spectral.yml**

```yaml
rules:
  my-rule-name:
    description: Tags must have a description.
    given: $.tags[*]
    severity: error
    then:
      field: description
      function: truthy
```

The example above adds a single rule that checks that tags objects have a description property defined.

Running `spectral lint` on the following object with the rulset above will result in an error being reported, since the tag does not have a description:

```json
{
  "tags": [{
    "name": "animals"
  }]
}
```

While running it with this object will succeed:

```json
{
  "tags": [{
    "name": "animals",
    "description": "come in all shapes and sizes"
  }]
}
```

### Adding to the recommended OpenAPI rules

Spectral comes with two built in rulesets - one for OpenAPI v2 (`spectral:oas2`), and one for OpenAPI v3 (`spectral:oas3`). Use the `extends` property in your ruleset file to build upon or customize other rulesets.

**spectral.yml**

```yaml
extends: spectral:oas2
rules:
  my-rule-name:
    description: Tags must have a description.
    given: $.tags[*]
    then:
      field: description
      function: truthy
```

The example above will apply the recommended rules from the built in OpenAPI v2 ruleset AND apply the custom `my-rule-name` rule.

### Enabling specific OpenAPI rules

Sometimes you might want to apply specific rules from another ruleset. Use the `extends` property, and pass `off` as the second argument in order to load add the rules from another ruleset, but disable them all by default. This allows you to pick and choose which rules you would like to enable.

**spectral.yml**

```yaml
extends: [[spectral:oas2, off]]
rules:
  # This rule is defined in the spectral:oas2 ruleset. We're passing `true` to turn it on and inherit the severity defined in the spectral:oas2 ruleset.
  operation-operationId-unique: true
```

The example above will run the two rules we enabled, since we pass `off` to disable all rules by default when extending the `spectral:oas2` ruleset.

### Disabling specific OpenAPI rules

This example shows the opposite of the `Enabling specific OpenAPI rules` example. Sometimes you might want to enable all rules by default, and disable a few.

**spectral.yml**

```yaml
extends: [[spectral:oas2, all]]

# we could also just extend spectral:oas2 like this, which would only run the recommended rules (rather than every single rule)
# extends: spectral:oas2

rules:
  operation-operationId-unique: false
```

The example above will run all of the rules defined in the `spectral:oas2` ruleset (rather than the default behavior that runs just the recommended ones), with two exceptions - we turned `operation-operationId-unique` and `operation-2xx-response` off.

### Changing the severity of a rule

**spectral.yml**

```yaml
extends: spectral:oas2
rules:
  operation-2xx-response: warn
```

The example above will run the recommended rules from the `spectral:oas2` ruleset, but report `operation-2xx-response` as a warning rather than as an error (as is the default behavior in the `spectral:oas2` ruleset).

Available severity levels are `error`, `warn`, `info`, and `off`.

## Rules

Rules are highly configurable. There are only few required parameters but the optional ones gives powerful flexibility. Please see the following type tables for more information.

<!-- *TODO: generate this table automatically from the TS file.* -->

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>given</td>
      <td><code>string</code></td>
      <td><b>Required</b> Filter the target down to a subset with a <b>JSON path</b>. Example <code>'$.paths..example'</code></td>
    </tr>
    <tr>
      <td>then</td>
      <td><code><a href="#then">Then</a> | <a href="#then">Then</a>[]</code></td>
      <td><b>Required</b> Filter the target down to a subset with a <b>JSON path</b>. Example <code>'$.paths..example'</code></td>
    </tr>
    <tr>
      <td>type</td>
      <td><code>'validation' | 'style'`</code></td>
      <td></td>
    </tr>
    <tr>
      <td>summary</td>
      <td><code>string</code></td>
      <td>A short summary of the rule and its intended purpose</td>
    </tr>
    <tr>
      <td>description</td>
      <td><code>string</code></td>
      <td>A long-form description of the rule formatted in markdown</td>
    </tr>
    <tr>
      <td>severity</td>
      <td><code>Error = 0, Warning = 1, Information = 2, Hint = 3</code></td>
      <td>The severity of results this rule generates</td>
    </tr>
    <tr>
      <td>tags</td>
      <td><code>string[]</code></td>
      <td>Tags attached to the rule, which can be used for organizational purposes</td>
    </tr>
    <tr>
      <td>recommended</td>
      <td><code>boolean</code></td>
      <td>should the rule be enabled by default?</td>
    </tr>
    <tr>
      <td>when</td>
      <td><code><a href="#when">When</a></code></td>
      <td>A filter object to narrow down the selected items.</td>
    </tr>
  </tbody>
</table>

### Then

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>function</td>
      <td><code>string</code></td>
      <td><b>Required</b> Name of the function to run. Note: to use a function you must first register it (<code>spectral.addFunctions(...)</code>). Please check out the default common functions.</td>
    </tr>
    <tr>
      <td>field</td>
      <td><code>string</code></td>
      <td>Name of the field to narrow by or special <code>@key</code> value. If a field name is provided, the function will receive value of that field. If <code>@key</code> is provided, the function will receive its key.<br/>Example: if the target object is an oas object and given = <code>$..responses[*]</code>, then <code>@key</code> would be the response code (200, 400, etc) and <code>description</code> would be the value of each response's description</td>
    </tr>
    <tr>
      <td>functionOptions</td>
      <td><code>Object</code></td>
      <td>Options passed to the function. Specific to the function in use.</td>
    </tr>
  </tbody>
</table>

### When

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>field</td>
      <td><code>string</code></td>
      <td><b>Required</b> The <code>path.to.prop</code> to field, or special <code>@key</code> value to target keys for matched <code>given</code> object. <br/><br/> Example: if the target object is an oas object and given = <code>$..responses[*]</code>, then <code>@key</code> would be the response code (200, 400, etc)</td>
    </tr>
    <tr>
      <td>pattern</td>
      <td><code>string</code></td>
      <td>A regex pattern</td>
    </tr>
  </tbody>
</table>

## Ruleset Validation

We use JSON Schema & AJV to validate your rulesets file and help you spot issues early.

**Example output**

```bash
$ spectral lint some-oas.yaml --ruleset acme-company.json

Reading ruleset

/rules/rule-without-given-nor-them 	 should have required property 'given'
/rules/rule-without-given-nor-them 	 should have required property 'then'
/rules/rule-with-invalid-enum/severity 	 should be number
/rules/rule-with-invalid-enum/severity 	 should be equal to one of the allowed values
/rules/rule-with-invalid-enum/type 	 should be equal to one of the allowed values
```

These errors should look just like errors you get from Spectral when an API description is invalid,
so use them to fix your rules in the same way.
