# OpenAPI Support

Spectral is a generic linter, but a lot of effort has been put in to making sure OpenAPI is well supported. 

Run Spectral against a document without specifying a ruleset will trigger an auto-detect, where Spectral will look to see if `swagger: 2.0` or `openapi: 3.0.x` is at the top of the file. If it finds either of those it will load `spectral:oas2` or `spectral:oas3`, both of which are documented in our [Reference > OpenAPI Rules](../reference/openapi-rules.md).

<!-- theme: info -->
> If you would like support for other API description formats like [RAML](https://raml.org/), message formats like [JSON:API](https://jsonapi.org/), event-driven API descriptions like [AsyncAPI](https://asyncapi.io/), etc., we recommend you start building custom but generic rulesets which can be shared with others. We've started putting together some over here on [OpenAPI Contrib](https://github.com/openapi-contrib/style-guides/)._
