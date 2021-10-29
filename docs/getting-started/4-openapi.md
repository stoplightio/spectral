# OpenAPI Support

Spectral is a generic linter, but you can add an "oas" ruleset, with OAS being shorthand for the [OpenAPI Specification](https://openapis.org/specification).

Add `extends: "spectral:oas"` to your ruleset file to apply rules for OpenAPI v2 and v3.x, depending on the appropriate OpenAPI version used (detected through [formats](../getting-started/3-rulesets.md#formats). See the [OpenAPI Rules](../reference/openapi-rules.md).

<!-- theme: info -->

> If you would like support for other API description formats like [RAML](https://raml.org/), message formats like [JSON:API](https://jsonapi.org/), etc., we recommend you start building custom but generic rulesets which can be shared with others. We've started putting together some over here on [OpenAPI Contrib](https://github.com/openapi-contrib/style-guides/).
