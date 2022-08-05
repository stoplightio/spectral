# Concepts

The power of integrating linting into the design-first workflow, or any workflow which involves API descriptions, is often overlooked. Linting is not just about validating OpenAPI or JSON Schema documents against specifications. It is for enforcing style guides to ensure that your APIs are consistent, valid, and of high quality.

To achieve this, Spectral has three key concepts:

- **Rules** filter your object down to a set of target values and specify the function (or functions) used to evaluate those values.
- **Functions** accept a value and return issues if the value is incorrect.
- **Rulesets** act as a container for rules and functions.

Spectral comes bundled with a [set of core functions](../reference/functions.md) and rulesets for working with [OpenAPI v2 and v3](./4-openapi.md) and [AsyncAPI v2](./5-asyncapi.md) that you can chose to use or extend, but Spectral is about far more than just checking your OpenAPI/AsyncAPI documents are valid.

By far the most popular use-case of Spectral is automating [API Style Guides](https://stoplight.io/api-style-guides-guidelines-and-best-practices?utm_source=github&utm_medium=spectral&utm_campaign=docs), implementing rules that your Architecture, DevOps, API Governance or "Center of Excellence" teams have decided upon. Companies generally write these style guides as wiki pages, and loads can be found on [API Style Book.com](http://apistylebook.com/), but most of these rules could be automated with Spectral.

- Paths must be `/kebab-case` ([more ideas for URL rules](https://blog.stoplight.io/consistent-api-urls-with-openapi-and-style-guides))
- HTTP Basic is not allowed at this company
- Restrict use of numeric integers in favor of UUID or whatever other ID patter you pick
- Enforce consistent hypermedia formats, like [JSON:API], or [another format](https://sookocheff.com/post/api/on-choosing-a-hypermedia-format/).

To do that, you'll want to learn a bit more about how rulesets work.

[Learn more about rulesets](./3-rulesets.md).
