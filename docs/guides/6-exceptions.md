# Exceptions

From time to time, you want to ignore some specific results without turning off
the rule entirely. This may happen, for instance, when working with legacy APIs which are no where near the standards of your modern APIs, but you cannot fix everything all at once.

The ruleset can be extended for that purpose through the optional `except` property. `except` describes a map of locations (expressed as paths and [JSON Pointers](https://tools.ietf.org/html/rfc6901)) and rules that should be ignored.

Locations be can either described as relative to the ruleset or absolute paths.

```yaml
extends: spectral:oas

except:
  "subfolder/one.yaml#":
    - oas3-api-servers
  "/tmp/docs/one.yaml#/info":
    - info-contact
    - info-description
```

<!-- theme: info -->
> As per the [RFC 6901](https://tools.ietf.org/html/rfc6901#section-3), special characters
> `~` and `/` have to be escaped to `~0` and `~1` respectively. For instance, the location of the `get` method from a
> `/todos` path in an openapi document `/root/here.yaml` would be expressed as `/root/here.yaml#/paths/~1todos/get`.
>
> *Hint:* Running Spectral cli with the `--format json` parameter is pretty useful to find out the path segments of each result.
