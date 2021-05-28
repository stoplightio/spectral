## Spectral

WILL throw if:

- a ruleset:
  - cannot be loaded
  - is invalid
- a rule:
  - JSON Path expression is not valid from syntax's perspective
  - there was an exception when executing a rule's function
- message evaluation fails
- document does not match any _registered_ format (can be surpressed with ignoreUnknownFormat). Won't fail if no format is registered

WILL NOT throw if:

- $ref resolving encounters issues
- a rule:
  - a _valid_ json path expression throws any Error

* Function MUST throw if:
  - something goes wrong
  - options are invalid

2. Functions must not throw if input is invalid -
