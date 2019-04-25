# Spectral Rulesets

## Usage

```bash
spectral lint foo.yaml --ruleset=path/to/acme-company-ruleset.yaml --ruleset=http://example.com/acme-common-ruleset.yaml
```

## Example ruleset file

We currently support ruleset files in both `yaml` and `json` formats.

```yaml
extends:
  - https://acme.com/ruleset.json
  - /path/to/ruleset.yaml
rules:
    rule-name:
        given: $..parameters[*]
        then:
            field: description
            function: truthy
```

## Rules

Rules are highly configurable. There are only few required parameters but the optional ones gives powerful flexibility. Please see the following type tables for more information.

*TODO: generate this table automatically from the TS file.*

### Rule

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
      <td>enabled</td>
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
      <td>Name of the field to narrow by. Given this field, the function will receive value of that field.</td>
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
      <td>patterns</td>
      <td><code>string</code></td>
      <td>A regex pattern</td>
    </tr>
  </tbody>
</table>

### Ruleset validation

We use JSON Schema & AJV to validate your rulesets file and help you spot issues early.

**Example output**

```bash
spectral lint some-oas.yaml --ruleset acme-company.json

Reading ruleset

/rules/rule-without-given-nor-them 	 should have required property 'given' 
/rules/rule-without-given-nor-them 	 should have required property 'then' 
/rules/rule-with-invalid-enum/severity 	 should be number 
/rules/rule-with-invalid-enum/severity 	 should be equal to one of the allowed values 
/rules/rule-with-invalid-enum/type 	 should be equal to one of the allowed values 
```

**Note for developers**

Supporting YAML and JSON file validation doesn't come free. 
We need to maintain schema files that mirror IRule and IRuleset types (see `/src/meta/*.schema.json`).
Ideally, we would have a script that converts TS type to JSON Schema and keeps the meta files up to date. As of now we have a helper that partially automates the work.

Execute `yarn schema.update` to recreate the `/src/meta/rule.schema.json`.
It will take `IRule` type from `types.ts` file and automatically update the JSON Schema file we use to validate yaml/json ruleset files.
**Warning**: make sure to update *generic* types. Current tools fails to recognize it properly and e.g. treats `string` as `object`.