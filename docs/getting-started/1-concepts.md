# Concepts

The power of integrating linting into the design-first workflow, or any workflow which involves API descriptions, is often overlooked.

Linting is not just about checking to see if some OpenAPI or JSON Schema documents are technically correct according to the specifications, they are for enforcing style guides! These style guides, much like eslint, can help catch a lot more than just "invalid syntax."

To achieve this functionality, Spectral has three key concepts: "Rulesets", "Rules", and "Functions."

- **Rulesets** act as a container for rules and functions.
- **Rules** filter your object down to a set of target values, and specify the function that is used to evaluate those values.
- **Functions** accept a value and return issue(s) if the value is incorrect.

Rules can be comprised of one of more functions, to facilitate any style guide.

- HTTP Basic is not allowed at this company
- Are all operations secured with a security schema
- Descriptions must not contain Markdown
- Tags must be plural
- Tags must be singular

Spectral comes bundled with a [bunch of functions](../reference/functions.md) and default style guides for [OpenAPI v2 and v3](./4-openapi.md) and [AsyncAPI v2](./5-asyncapi.md), which you can extend, cherry-pick, or disable entirely.

[Learn more about rulesets](./3-rulesets.md).
