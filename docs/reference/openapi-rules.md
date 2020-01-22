# OpenAPI Rules

Spectral has a built-in "oas" ruleset, with OAS being shorthand for the [OpenAPI Specification](https://openapis.org/specification).

In your ruleset file you can add `extends: "spectral:oas"` and you'll get all of the following rules applied, depending on the appropriate OpenAPI version used (detected through [formats](../getting-started/rulesets.md#formats)).

## OpenAPI v2 & v3

These rules apply to both OpenAPI v2 and v3.

### operation-2xx-response

Operation must have at least one `2xx` response. Any API operation (endpoint) can fail but presumably it is also meant to do something constructive at some point. If you forget to write out a success case for this API, then this rule will let you know.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /path:
    get:
      responses:
        418:
          description: teapot
```

### operation-operationId-unique

Every operation must have a unique `operationId`. 

Why? A lot of documentation systems use this as an identifier, some SDK generators convert them to a method name, all sorts of things like that.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /pet:
    patch:
      operationId: "update-pet"
      responses: 
        200:
          description: ok
    put:
      operationId: "update-pet"
      responses: 
        200:
          description: ok
```

**Good Example**

```yaml
paths:
  /pet:
    patch:
      operationId: "update-pet"
      responses: 
        200:
          description: ok
    put:
      operationId: "replace-pet"
      responses: 
        200:
          description: ok
```

### operation-parameters

Operation parameters are unique and non-repeating.

1. Operations must have unique `name` + `in` parameters.
2. Operation cannot have both `in: body` and `in: formData` parameters. (OpenAPI v2.0)
3. Operation must have only one `in: body` parameter. (OpenAPI v2.0)

**Recommended:** Yes

### path-params

Path parameters are correct and valid.

1. for every param referenced in the path string (i.e: `/users/{userId}`), the parameter must be defined in either
   `path.parameters`, or `operation.parameters` objects.

2. every `path.parameters` and `operation.parameters` parameter must be used in the path string

**Recommended:** Yes

### contact-properties

The [info-contact](#info-contact) rule will ask you to put in a contact object, and this rule will make sure it's full of the most useful properties: `name`, `url` and `email`. 

Putting in the name of the developer/team/department/company responsible for the API, along with the support email and help-desk/GitHub Issues/whatever URL means people know where to go for help. This can mean more money in the bank, instead of developers just wandering off or complaining online.

**Recommended:** No

**Good Example**

```yaml
openapi: "3.0.2"
info:
  title: Awesome API
  description: A very well defined API
  version: "1.0"
  contact:
    name: A-Team
    email: a-team@goarmy.com
    url: goarmy.com/apis/support
```

### example-value-or-externalValue

Examples for `requestBody` or response examples can have an `externalValue` or a `value`, but they cannot have both.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /pet:
    put:
      operationId: "relace-pet"
      requestBody:
        content:
          'application/json':
            examples: 
              foo:
                summary: A foo example
                value: {"foo": "bar"}
                externalValue: 'http://example.org/foo.json' 
                # marp! no, can only have one or the other
```

### info-contact

Info object should contain `contact` object. 

Hopefully your API description document is so good that nobody ever needs to contact you with questions, but that is rarely the case. The contact object has a few different options for contact details.

**Recommended:** Yes

**Good Example**

```yaml
openapi: "3.0.2"
info:
  title: Awesome API
  version: "1.0"
  contact: 
    name: A-Team
    email: a-team@goarmy.com
```

### info-description

OpenAPI object info `description` must be present and non-empty string.

Examples can contain Markdown so you can really go to town with them, implementing getting started information like where to find authentication keys, and how to use them.

**Recommended:** Yes

**Good Example**

```yaml
openapi: 3.0.0
info:
  version: '1.0.0'
  title: Descriptive API
  description: >+
    Some description about the general point of this API, and why it exists when another similar but different API also exists.

    ## Authentication

    This API uses OAuth2 and tokens can be requested from [Dev Portal: Tokens](https://example.org/developers/tokens).
```

### info-license

The `info` object should have a `license` key.

It can be hard to pick a license, so if you don't have a lawyer around you can use [TLDRLegal](https://tldrlegal.com/) and [Choose a License](https://choosealicense.com/) to help give you an idea. 

How useful this is in court is not entirely known, but having a license is better than not having a license. 

**Recommended:** Yes

**Good Example**

```yaml
openapi: "3.0.2"
info:
  license:
    name: MIT
```

### license-url

Mentioning a license is only useful if people know what the license means, so add a link to the full text for those who need it.

**Recommended:** Yes

**Good Example**

```yaml
openapi: "3.0.2"
info:
  license:
    name: MIT
    url: https://www.tldrlegal.com/l/mit
```

### no-eval-in-markdown

This rule protects against an edge case, for anyone bringing in description documents from third parties and using the parsed content rendered in HTML/JS. If one of those third parties does something shady like inject `eval()` JavaScript statements, it could lead to an XSS attack. 

**Recommended:** Yes

**Bad Example**

```yaml
openapi: "3.0.2"
info:
  title: 'some title with eval(',
```

### no-script-tags-in-markdown

This rule protects against a potential hack, for anyone bringing in description documents from third parties then generating HTML documentation. If one of those third parties does something shady like inject `<script>` tags, they could easily execute arbitrary code on your domain, which if it's the same as your main application could be all sorts of terrible.

**Recommended:** Yes

**Bad Example**

```yaml
openapi: "3.0.2"
info:
  title: 'some title with <script>alert("You are Hacked");</script>',
```

### openapi-tags-alphabetical

OpenAPI object should have alphabetical `tags`. This will be sorted by the `name` property.

**Recommended:** No

**Bad Example**

```yaml
tags: 
  - name: 'Badger'
  - name: 'Aardvark'
```

**Good Example**

```yaml
tags: 
  - name: 'Aardvark'
  - name: 'Badger'
```

### openapi-tags

OpenAPI object should have non-empty `tags` array.

Why? Well, you _can_ reference tags arbitrarily in operations, and definition is optional...

```yaml
/invoices/{id}/items:
  get:
    tags:
    - Invoice Items
```

Defining tags allows you to add more information like a `description`. For more information see [tag-description](#tag-description).

**Recommended:** Yes

### operation-default-response

**Recommended:** No

### operation-description

**Recommended:** Yes

### operation-operationId

This operation ID is essentially a reference for the operation, which can be used to visually suggest a connection to other operations. This is like some theoretical static HATEOAS-style referencing, but it's also used for the URL in some documentation systems.

Make the value `lower-hyphen-case`, and try and think of a name for the action which does not relate to the HTTP message. Base it off the actual action being performed. `create-polygon`? `search-by-polygon`? `filter-companies`?

**Recommended:** Yes

### operation-operationId-valid-in-url

Seeing as operationId is often used for unique URLs in documentation systems, it's a good idea to avoid non-URL safe characters.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /pets:
    get:
      operationId: get cats
```

### operation-singular-tag

Use just one tag for an operation, which is helpful for some documentation systems which use tags to avoid duplicate content.

**Recommended:** No

### operation-summary-formatted

<!-- theme: warning -->
> ### Removed in v5.0
>
> This rule was removed in Spectral v5.0, so if you are relying on it you can find the [old definition here](https://github.com/stoplightio/spectral/blob/v4.2.0/src/rulesets/oas/index.json#L312) and paste it into your [custom ruleset](../getting-started/rulesets.md).

Operation `summary` should start with upper case and end with a dot.

**Recommended:** No

### operation-tags

Operation should have non-empty `tags` array.

**Recommended:** Yes

### operation-tag-defined

Operation tags should be defined in global tags.

**Recommended:** Yes

### path-declarations-must-exist

Path parameter declarations cannot be empty, ex.`/given/{}` is invalid.

**Recommended:** Yes

### path-keys-no-trailing-slash

Keep trailing slashes off of paths, as it can cause some confusion. Some web tooling (like mock servers, real servers, code generators, application frameworks, etc.) will treat `example.com/foo` and `example.com/foo/` as the same thing, but other tooling will not. Avoid any confusion by just documenting them without the slash, and maybe some tooling will let people shove a / on there when they're using it or maybe not, but at least the docs are suggesting how it should be done properly.

**Recommended:** Yes

### path-not-include-query

Don't put query string items in the path, they belong in parameters with `in: query`.

**Recommended:** Yes

### tag-description

Tags alone are not very descriptive. Give folks a bit more information to work with.

```yaml
tags: 
  - name: 'Aardvark'
    description: Funny nosed pig-head racoon.
  - name: 'Badger'
    description: Angry short-legged omnivores.
```

If your tags are business objects then you can use the term to explain them a bit. An 'Account' could be a user account, company information, bank account, potential sales lead, anything. What is clear to the folks writing the document is probably not as clear to others.

```yaml
tags:
  - name: Invoice Items
    description: |+
      Giant long explanation about what this business concept is, because other people _might_ not have a clue!
```

**Recommended:** No

### typed-enum

Enum values should respect the `type` specifier. 

**Recommended:** Yes

**Good Example**

```yaml
TheGoodModel:
  type: object
  properties:
    number_of_connectors:
      type: integer
      description: The number of extension points.
      enum:
        - 1
        - 2
        - 4
        - 8
```

**Bad Example**

```yaml
TheBadModel:
  type: object
  properties:
    number_of_connectors:
      type: integer
      description: The number of extension points.
      enum:
        - 1
        - 2
        - 'a string!'
        - 8
```

## OpenAPI v2.0-only

These rules will only apply to OpenAPI v2.0 documents.

### oas2-operation-formData-consume-check

Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.

**Recommended:** Yes

### oas2-api-host

OpenAPI `host` must be present and non-empty string.

**Recommended:** Yes

### oas2-api-schemes

OpenAPI host `schemes` must be present and non-empty array.

**Recommended:** Yes

### oas2-host-not-example

Server URL should not point at example.com.

**Recommended:** No

### oas2-host-trailing-slash

Server URL should not have a trailing slash.

**Recommended:** Yes

### oas2-operation-security-defined

Operation `security` values must match a scheme defined in the `securityDefinitions` object.
Ignores empty `security` values for cases where authentication is explicitly not required or optional.

**Recommended:** Yes

### oas2-unused-definition

Potential unused reusable `definition` entry has been detected.

_Warning:_ This rule may identify false positives when linting a specification
that acts as a library (a container storing reusable objects, leveraged by other
specifications that reference those objects).

**Recommended:** Yes

### oas2-valid-example

Examples must be valid against their defined schema.

**Recommended:** Yes

### oas2-anyOf

OpenAPI v3 keyword `anyOf` detected in OpenAPI v2 document.

**Recommended:** Yes

### oas2-oneOf

OpenAPI v3 keyword `oneOf` detected in OpenAPI v2 document.

**Recommended:** Yes

### oas2-schema

Validate structure of OpenAPI v2 specification.

**Recommended:** Yes

### oas2-parameter-description

Parameter objects should have a `description`.

**Recommended:** No

## OpenAPI v3-only

These rules will only be applied to OpenAPI v3.0 documents.

### oas3-api-servers

OpenAPI `servers` must be present and non-empty array.

**Recommended:** Yes

Share links to any and all servers that people might care about. If this is going to be given to internal people then usually that is localhost (so they know the right port number), staging, and production.

``` yaml
servers:
  - url: https://example.com/api
    description: Production server
  - url: https://staging.example.com/api
    description: Staging server
  - url: http://localhost:3001
    description: Development server
```

If this is going out to the world, maybe have production and a general sandbox people can play with.

### oas3-operation-security-defined

Operation `security` values must match a scheme defined in the `components.securitySchemes` object.

**Recommended:** Yes

### oas3-server-not-example.com

Server URL should not point at example.com.

**Recommended:** No

**Bad Example**

``` yaml
servers:
  - url: https://example.com/api
    description: Production server
  - url: https://staging.example.com/api
    description: Staging server
  - url: http://localhost:3001
    description: Development server
```

We have example.com for documentation purposes here, but you should put in actual domains.

### oas3-server-trailing-slash

Server URL should not have a trailing slash.

Some tooling forgets to strip trailing slashes off when it's joining the `servers.url` with `paths`, and you can get awkward URLs like `https://example.com/api//pets`. Best to just strip them off yourself.

**Recommended:** Yes

**Good Example**

``` yaml
servers:
  - url: https://example.com
  - url: https://example.com/api
```

**Bad Example**

``` yaml
servers:
  - url: https://example.com/
  - url: https://example.com/api/
```

### oas3-unused-components-schema

Potential unused reusable `schema` entry has been detected.

_Warning:_ This rule may identify false positives when linting a specification
that acts as a library (a container storing reusable objects, leveraged by other
specifications that reference those objects).

**Recommended:** Yes

### oas3-valid-example

Examples must be valid against their defined schema.

**Recommended:** Yes

### oas3-schema

Validate structure of OpenAPI v3 specification.

**Recommended:** Yes

### oas3-parameter-description

Parameter objects should have a `description`.

**Recommended:** No
