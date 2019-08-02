# OpenAPI Support

Spectral is a generic linter, but a lot of effort has been put in to making sure OpenAPI is well supported. 

Run Spectral against a document without specifying a ruleset will trigger an autodetect, where Spectral will look to see if `swagger: 2.0` or `openapi: 3.0.x` is at the top of the file. If it finds either of those it will load `spectral:oas2` or `spectral:oas3`, both of which are documented in our [Reference > OpenAPI Rules](TODO OpenAPI Rules).

_**Note:** If you would like support for other API description formats like RAML, message formats like JSON:API, or anything at all, we recommend you start building up custom, but generic rulesets that can be shared with others. These can then be shared around in a sort of marketplace in the future._