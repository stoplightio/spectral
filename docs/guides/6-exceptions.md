# Exceptions

From time to time, you want to ignore some specific results without [turning off the rule entirely](./4-custom-rulesets.md#disabling-rules). For instance, you may want to do this when working on a project that has several legacy APIs which are nowhere near the standards of your modern APIs, and you cannot fix all the errors for a specific file all at once.

The ruleset can be extended for that purpose through the optional `except` property. `except` describes a map of locations (expressed as paths and [JSON Pointers](https://tools.ietf.org/html/rfc6901)) and rules that should be ignored.

Locations be can either described as relative to the ruleset or absolute paths.

```yaml
extends: spectral:oas

except:
  "subfolder/one.yaml#":
    - no-$ref-siblings
  "/tmp/docs/one.yaml#/info":
    - info-contact
    - info-description
```

Doing this in a ruleset which is being distributed to multiple APIs is possible, but might not be what you want to do. Maybe the files your writing exceptions for do not exist in other projects, or maybe they do not need this exception being added.

Instead, let's create two rulesets.

One we'll call the main ruleset which is the one we're distributing via a URL, NPM, or some other means. This ruleset will describe the ideal set of rules:

```yaml
# https://acme.org/ruleset.yaml
extends: spectral:oas

rules:
  # all your custom rules
```

Then a second ruleset will be created in project root, which will be created in the project with the appropriate extensions. Assuming you chose a URL to distribute the ruleset, it would look like this:

```yaml
# .spectral.yaml
extends: https://acme.org/ruleset.yaml

except:
  "subfolder/one.yaml#":
    - oas3-api-servers
  "/tmp/docs/one.yaml#/info":
    - info-contact
    - info-description
```

Done!

In the future when the API is improved to pass those rules, they can be removed. If they get everything done the project ruleset will just look like this:

```yaml
extends: https://acme.org/ruleset.yaml
```

If you wish to turn a given rule for a whole file, you should skip pointer.

```yaml
# .spectral.yaml
extends: https://acme.org/ruleset.yaml

except:
  "subfolder/one.yaml":
    - my-rule
```

## Special Characters

[RFC 6901](https://tools.ietf.org/html/rfc6901#section-3) says that special characters
`~` and `/` must be escaped as `~0` and `~1` respectively where they
appear in a path. E.g.: the location of the `get` method from a
`/todos` path in OpenAPI document `/root/here.yaml` would be expressed as `/root/here.yaml#/paths/~1todos/get`.

An example with more path segments: the location for a `get` method from a
`/todos/{todo_id}/labels` path in an openapi document `/root/here.yaml`
would be expressed as `/root/here.yaml#/paths/~1todos~1{todo_id}~1labels/get`.

<!-- theme: info -->

> Running Spectral CLI with the `--format json` parameter is pretty useful to find out the path segments of each result.
