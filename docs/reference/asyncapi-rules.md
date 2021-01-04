# AsyncAPI Rules

Spectral has a built-in "asyncapi" ruleset for the [AsyncAPI Specification](https://www.asyncapi.com/docs/specifications/2.0.0/).

In your ruleset file you can add `extends: "spectral:asyncapi"` and you'll get all of the following rules applied.

These rules will only apply to AsyncAPI v2 documents.

### asyncapi-channel-no-empty-parameter

Channel parameter declarations cannot be empty, ex.`/given/{}` is invalid.

**Recommended:** Yes

### asyncapi-channel-no-query-nor-fragment

Query parameters and fragments shouldn't be used in channel names. Instead, use bindings to define them.

**Recommended:** Yes

### asyncapi-channel-no-trailing-slash

Keep trailing slashes off of channel names, as it can cause some confusion. Most messaging protocols will treat `example/foo` and `example/foo/` as different things. Keep in mind that tooling may replace slashes (`/`) with protocol-specific notation (e.g.: `.` for AMQP), therefore, a trailing slash may result in an invalid channel name in some protocols.

**Recommended:** Yes

### asyncapi-headers-schema-type-object

The schema definition of the application headers must be of type “object”.

**Recommended:** Yes

### asyncapi-info-contact-properties

The [asyncapi-info-contact](#asyncapi-info-contact) rule will ask you to put in a contact object, and this rule will make sure it's full of the most useful properties: `name`, `url` and `email`.

Putting in the name of the developer/team/department/company responsible for the API, along with the support email and help-desk/GitHub Issues/whatever URL means people know where to go for help. This can mean more money in the bank, instead of developers just wandering off or complaining online.

**Recommended:** Yes

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  title: Awesome API
  description: A very well defined API
  version: "1.0"
  contact:
    name: A-Team
    email: a-team@goarmy.com
    url: https://goarmy.com/apis/support
```

### asyncapi-info-contact

Info object should contain `contact` object.

Hopefully your API description document is so good that nobody ever needs to contact you with questions, but that is rarely the case. The contact object has a few different options for contact details.

**Recommended:** Yes

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  title: Awesome API
  version: "1.0"
  contact:
    name: A-Team
    email: a-team@goarmy.com
```

### asyncapi-info-description

AsyncAPI object info `description` must be present and non-empty string.

Examples can contain Markdown so you can really go to town with them, implementing getting started information like where to find authentication keys, and how to use them.

**Recommended:** Yes

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  version: "1.0.0"
  title: Descriptive API
  description: >+
    Some description about the general point of this API, and why it exists when another similar but different API also exists.

```

### asyncapi-info-license-url

Mentioning a license is only useful if people know what the license means, so add a link to the full text for those who need it.

**Recommended:** No

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  license:
    name: MIT
    url: https://www.tldrlegal.com/l/mit
```

### asyncapi-info-license

The `info` object should have a `license` key.

It can be hard to pick a license, so if you don't have a lawyer around you can use [TLDRLegal](https://tldrlegal.com/) and [Choose a License](https://choosealicense.com/) to help give you an idea.

How useful this is in court is not entirely known, but having a license is better than not having a license.

**Recommended:** Yes

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  license:
    name: MIT
```

### asyncapi-operation-description

Operation objects should have a description.

**Recommended:** Yes

### asyncapi-operation-operationId

This operation ID is essentially a reference for the operation. Tools may use it for defining function names, class method names, and even URL hashes in documentation systems.

**Recommended:** Yes

### asyncapi-parameter-description

Parameter objects should have a `description`.

**Recommended:** No

### asyncapi-payload-default

`default` objects should be valid against the `payload` they decorate.

**Recommended:** Yes

**Good Example**

```yaml
payload:
  type: object
  properties:
    value:
      type: integer
  required:
    - value
  default:
    value: 17
```

**Bad Example**

```yaml
payload:
  type: object
  properties:
    value:
      type: integer
  required:
    - value
  default:
    value: nope!
```

### asyncapi-payload-examples

Values of the `examples` array should be valid against the `payload` they decorate.

**Recommended:** Yes

**Good Example**

```yaml
payload:
  type: object
  properties:
    value:
      type: integer
  required:
    - value
  examples:
    - value: 13
    - value: 17
```

**Bad Example**

```yaml
payload:
  type: object
  properties:
    value:
      type: integer
  required:
    - value
  examples:
    - value: nope! # Wrong type
    - notGoodEither: 17 # Missing required property
```

### asyncapi-payload-unsupported-schemaFormat

AsyncAPI can support various `schemaFormat` values. When unspecified, one of the following will be assumed:

application/vnd.aai.asyncapi;version=2.0.0
application/vnd.aai.asyncapi+json;version=2.0.0
application/vnd.aai.asyncapi+yaml;version=2.0.0

At this point, explicitly setting `schemaFormat` is not supported by Spectral, so if you use it this rule will emit an info message and skip validating the payload.

Other formats such as OpenAPI Schema Object, JSON Schema Draft 07 and Avro will be added in various upcoming versions.

**Recommended:** Yes

### asyncapi-payload

When `schemaFormat` is undefined, the `payload` object should be valid against the AsyncAPI 2 Schema Object definition.

**Recommended:** Yes

### asyncapi-schema-default

`default` objects should be valid against the `schema` they decorate.

**Recommended:** Yes

### asyncapi-schema-examples

Values of the `examples` array should be valid against the `schema` they decorate.

**Recommended:** Yes

### asyncapi-schema

Validate structure of AsyncAPI v2 specification.

**Recommended:** Yes

### asyncapi-server-no-empty-variable

Server URL variable declarations cannot be empty, ex.`gigantic-server.com/{}` is invalid.

**Recommended:** Yes

### asyncapi-server-no-trailing-slash

Server URL should not have a trailing slash.

Some tooling forgets to strip trailing slashes off when it's joining the `servers.url` with `channels`, and you can get awkward URLs like `mqtt://example.com/broker//pets`. Best to just strip them off yourself.

**Recommended:** Yes

**Good Example**

```yaml
servers:
  - url: mqtt://example.com
  - url: mqtt://example.com/broker
```

**Bad Example**

```yaml
servers:
  - url: mqtt://example.com/
  - url: mqtt://example.com/broker/
```

### asyncapi-server-not-example-com

Server URL should not point at example.com.

**Recommended:** No

### asyncapi-servers

A non empty `servers` object is expected to be located at the root of the document.

**Recommended:** Yes

### asyncapi-tag-description

Tags alone are not very descriptive. Give folks a bit more information to work with.

```yaml
tags:
  - name: "Aardvark"
    description: Funny nosed pig-head racoon.
  - name: "Badger"
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

### asyncapi-tags-alphabetical

AsyncAPI object should have alphabetical `tags`. This will be sorted by the `name` property.

**Recommended:** No

**Bad Example**

```yaml
tags:
  - name: "Badger"
  - name: "Aardvark"
```

**Good Example**

```yaml
tags:
  - name: "Aardvark"
  - name: "Badger"
```

**Recommended:** No

### asyncapi-tags

AsyncAPI object should have non-empty `tags` array.

Why? Well, you _can_ reference tags arbitrarily in operations, and definition is optional...

```yaml
/invoices/{id}/items:
  get:
    tags:
      - Invoice Items
```

Defining tags allows you to add more information like a `description`. For more information see [asyncapi-tag-description](#asyncapi-tag-description).

**Recommended:** Yes

### asyncapi-unused-components-schema

Potential unused reusable `schema` entry has been detected.

<!-- theme: warning -->

_Warning:_ This rule may identify false positives when linting a specification
that acts as a library (a container storing reusable objects, leveraged by other
specifications that reference those objects).

**Recommended:** Yes
