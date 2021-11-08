# Load a Ruleset

After you install Spectral, you need to create a default ruleset file or get a generic ruleset from a site like on [OpenAPI Contrib](https://github.com/openapi-contrib/style-guides/). Spectral will not lint documents if no ruleset is specified and no default ruleset file is found.

## Create a Ruleset

If you don't specify a ruleset file with the `--ruleset` parameter, the [Spectral CLI](../guides/2-cli.md) will look for a ruleset file called `.spectral.yml`, `.spectral.yaml`, `.spectral.json` or `.spectral.js` in the current working directory.

If you don't have a ruleset file, create one with that meets these rules. Once you are more familiar with Spectral, you can [customize your ruleset](../guides/4-custom-rulesets.md).

## Extend Rulesets

Rulesets can extend other rulesets using the `extends` property, allowing you to pull in other rulesets.

You can extend and modify our core rulesets:

### [OpenAPI ruleset](../reference/openapi-rules.md)


Add rules for OpenAPI v2 and v3.x to your ruleset file, depending on the appropriate OpenAPI version used (detected through [formats](../guides/3-rulesets.md#formats). 

```yaml
extends: spectral:oas
```
### [AsyncAPI ruleset](../reference/asyncapi-rules.md)
Add rules for AsyncAPI v2 to your ruleset file. 

```yaml
extends: spectral:asyncapi
```
### Distributed Rulesets

Extends can also reference any [distributed ruleset](../guides/7-sharing-rulesets.md). It can be a single string, or an array of strings, and can contain either local file paths, URLs, or even NPM modules.

```yaml
extends:
  - ./config/spectral.json
  - https://example.org/api/style.yaml
  - some-npm-module
```

The `extends` keyword can be combined with extra rules in order to extend and override rulesets. Learn more about that in [custom rulesets](../guides/4-custom-rulesets.md).

