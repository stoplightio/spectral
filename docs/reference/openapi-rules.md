# OpenAPI Rules

Spectral has three rulesets built in: 

- `spectral:oas`
- `spectral:oas2`
- `spectral:oas3`

_OAS is shorthand for OpenAPI Specification._

Both the OpenAPI v2 and v3 rulesets extend from the main OpenAPI ruleset, so if you definitely only want OpenAPI v3 you can extend from `spectral:oas3` and you'll have everything in `spectral:oas` and `spectral:oas3`.

Or, you can request `spectral:oas` and you'll get everything from `spectral:oas2` and `spectral:oas3`, meaning you can lint either type of document and only the relevant rules will apply thanks to [formats](../getting-started/rulesets.md#formats).

Let's look at the rules in these rulesets.

## oas

### operation-2xx-response

Operation must have at least one `2xx` response. Any API operation (endpoint) can fail but presumably it is also meant to do something constructive at some point. If you forget to write out a success case for this API, then this rule will let you know.

**Good Example**

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

Why? A lot of documentation systems use this as an identifier, some SDK generators convert them to a method name, all sorts of things like that. Giving each one a unique name avoids all sorts of problems.

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
      operationId: "update-pet" # marp! could have been "replace-pet"
      responses: 
        200:
          description: ok
```

### operation-parameters

Operation parameters are unique and non-repeating.

1. Operations must have unique `name` + `in` parameters.
2. Operation cannot have both `in: body` and `in: formData` parameters. (OpenAPI v2.0)
3. Operation must have only one `in: body` parameter. (OpenAPI v2.0)

### path-params

Path parameters are correct and valid.

1. for every param referenced in the path string (i.e: `/users/{userId}`), the parameter must be defined in either
   `path.parameters`, or `operation.parameters` objects.

2. every `path.parameters` and `operation.parameters` parameter must be used in the path string

### contact-properties

The `info-contact` rule will ask you to put in a contact object, and this rule will make sure its full of the most useful properties: `name`, `url` and `email`. 

Putting in the name of the developer/team/department/company responsible for the API, along with the support email and help-desk/GitHub Issues/whatever URL means people know where to go for help. This can mean more money in the bank, instead of developers just wandering off or complaining online.

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
                externalValue: 'http://example.org/foo.json' # blarp! no, can only have one or the other
```

### info-contact

Info object should contain `contact` object. 

Hopefully your API description document is so good that nobody ever needs to contact you with questions, but that is rarely the case. The contact object hasa few different options for contact details.

**Good Example**

```yaml
openapi: "3.0.2"
info:
  title: Awesome API
  description: A very well defined API
  version: "1.0"
  contact: # ok
    name: A-Team
    email: a-team@goarmy.com
```

### info-description

OpenAPI object info `description` must be present and non-empty string.

Examples can contain Markdown so you can really go to town with them, implementing getting started information like where to find authentication keys, and how to use them.

**Good Example**

```yaml
openapi: 3.0.0
info:
  version: '1.0.0'
  title: Descriptive API
  description: >+
    This Permissions API is based on the concept of Attribute Based Access Control (ABAC), 
    which is a little different from the more commonly used approach: Role Based Access 
    Control (RBAC).

    ## Use Cases

    Permissions API offers the answer questions like; "Can Gary book a room in this office
    in the context of Acme Company?"

    If Gary is not a member of Acme Company, or Acme Company has no current access to this building, then no.

    ## Authentication

    This API uses OAuth2 and tokens can be requested from [Dev Portal: Tokens](https://example.org/developers/tokens).
```

### info-license

The `info` object should have a `license` key.

It can be hard to pick a license, so if you don't have a lawyer around you can use [TLDRLegal](https://tldrlegal.com/) and [Choose a License](https://choosealicense.com/) to help give you an idea. 

How useful this is in court is not entirely known, but having a license is better than not having a license. 

**Good Example**

```yaml
openapi: "3.0.2"
info:
  license:
    name: MIT
```

### license-url

Mentioning a license is only useful if people know what the license means, so add a link to the full text for those who need it.

**Good Example**

```yaml
openapi: "3.0.2"
info:
  license:
    name: MIT
    url: https://www.tldrlegal.com/l/mit
```

### no-eval-in-markdown



**Example**

### no-script-tags-in-markdown



**Example**

### openapi-tags-alphabetical



**Example**

### openapi-tags



**Example**

### operation-default-response



**Example**

### operation-description



**Example**

### operation-operationId



**Example**

### operation-operationId-valid-in-url



**Example**

### operation-singular-tag



**Example**

### operation-summary-formatted



**Example**

### operation-tags



**Example**

### parameter-description



**Example**

### path-declarations-must-exist



**Example**

### path-keys-no-trailing-slash



**Example**

### path-not-include-query



**Example**

### tag-description



**Example**


## oas2

### operation-formData-consume-check



**Example**


## oas3
