## Recommended or All

Rules by default are considered "recommended" (equivalent to a rule having `recommended: true`), but they can also be marked as not recommended with `recommended: false`. This can help scenarios like rolling out rulesets across API landscapes with a lot of legacy APIs which might have a hard time following every rule immediately. A two-tier system for rules can be helpful to avoid requiring multiple rulesets for this basic use case.

You can try this out with the core OpenAPI ruleset. If you simply extend the ruleset, by default you only get the recommended rules.

```yaml
extends: [[spectral:oas, recommended]]
```

Far more rules exist than just the recommended ones. There are other rules to help you create high-quality OpenAPI descriptions.

```yaml
extends: [[spectral:oas, all]]
```

You can do this with your rulesets, and initially set new rules as "not recommended" so that the most interested active API designers/developers use them at first. Then, eventually roll them out to everyone if they're well received.

### Disabling Rules

This example shows the opposite of the "Enabling Specific Rules" example. Sometimes you might want to enable all rules by default, and disable a few.

```yaml
extends: [[spectral:oas, all]]
rules:
  operation-operationId-unique: off
```

The example above runs all the rules defined in the `spectral:oas` ruleset (rather than the default behavior that runs only the recommended ones), with one exception; `operation-operationId-unique` is set to off.

### Enabling Rules

Sometimes you might want to apply a limited number of rules from another ruleset. To do this, use the `extends` property with `off` as the second argument. This avoids running any rules from the extended ruleset as they are disabled. Then you can choose which rules you would like to enable.

```yaml
extends: [[spectral:oas, off]]
rules:
  operation-operationId-unique: true
```

The example above only runs the rule `operation-operationId-unique` that was enabled, since `off` was passed to disable all rules by default when extending the `spectral:oas` ruleset.
