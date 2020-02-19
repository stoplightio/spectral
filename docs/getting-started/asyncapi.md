# AsyncAPI Support

Spectral is a generic linter, but a lot of effort has been put in to making sure [AsyncAPI v2](https://www.asyncapi.com/docs/specifications/2.0.0/) is well supported.

Run Spectral against a document without specifying a ruleset will trigger an auto-detect, where Spectral will look to see if `asyncapi: 2.0.0` is in the root of the document. If it finds it, it will load `spectral:asyncapi`, which is documented in our [Reference > AsyncAPI Rules](../reference/asyncapi-rules.md).
