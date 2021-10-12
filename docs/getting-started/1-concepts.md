# Concepts

The power of integrating linting into the design-first workflow, or any workflow which involves API descriptions, is often overlooked. Linting is not just about validating OpenAPI or JSON Schema documents against specifications. It is for enforcing style guides to ensure that your APIs are consistent, valid, and of high quality.

To achieve this, Spectral has three key concepts: 

- **Rulesets** act as a container for rules and functions.
- **Rules** filter your object down to a set of target values and specify the function that is used to evaluate those values.
- **Functions** accept a value and return issues if the value is incorrect.

Rules can be comprised of one of more functions. For example:

- HTTP Basic is not allowed at this company
- All operations are secured with a security schema
- Descriptions must not contain Markdown
- Tags must be plural
- Tags must be singular

Spectral comes bundled with a [set of core functions](../reference/functions.md) and default style guides for [OpenAPI v2 and v3](./4-openapi.md) and [AsyncAPI v2](./5-asyncapi.md), which you can extend, cherry-pick, or disable entirely.

[Learn more about rulesets](./3-rulesets.md).
