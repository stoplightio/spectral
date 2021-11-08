# Concepts

The power of integrating linting into the design-first workflow, or any workflow which involves API descriptions, is often overlooked. Linting is not just about validating OpenAPI or JSON Schema documents against specifications. It is for enforcing style guides to ensure that your APIs are consistent, valid, and of high quality.

To achieve this, Spectral has three key concepts:

- **Rulesets** act as a container for rules and functions. 
- **Rules** filter your object down to a set of target values and specify the function that is used to evaluate those values.
- **Functions** accept a value and return issues if the value is incorrect.

Rules can be comprised of one of more functions. For example:

- HTTP Basic is not allowed
- All operations are secured with a security schema
- Descriptions must not contain Markdown
- Tags must be plural
- Tags must be singular

## Core Rulesets

Spectral is a generic linter, but comes bundled with a [set of core functions](../reference/functions.md) and default style guides for OpenAPI v2.x and v3.x and AsyncAPI v2. You can extend, cherry-pick, or disable rules to meet your needs. 

If you would like support for other API description formats like [RAML](https://raml.org/), message formats like [JSON:API](https://jsonapi.org/), etc., we recommend you start building custom but generic rulesets that can be shared with others. We've added some to [OpenAPI Contrib](https://github.com/openapi-contrib/style-guides/).

<!-- theme: info--> 
> #### Learn more about rulesets
  > - [Ruleset Concepts](../guides/3-rulesets.md) 
  > - [Load a Ruleset](./3-load-ruleset.md)
  > - [Make a Custom Ruleset](../guides/4-custom-rulesets.md)

## Ways to Use Spectral

When and where you use Spectral depends on how you create and manage your API description documents or other files you are trying to lint.

You can run Spectral:

- Against files for early feedback. Use the [Spectral CLI](../guides/2-cli.md) or the [Javascript API](../guides/2a-javascript.md) for this approach.
- Automatically as you work. Use [Stoplight Studio](https://stoplight.io/studio/?utm_source=github&utm_medium=spectral&utm_campaign=docs) or [VS Code](https://github.com/stoplightio/vscode-spectral?utm_source=github&utm_medium=spectral&utm_campaign=docs) for this approach.
- To enforce linting as part of the commit process. Use [Git hooks](../guides/1-workflows.md) for this approach.
- With [Continuous Integration](../guides/8-continuous-integration.md) to reject pull requests that don't match your rulesets and style guide.







