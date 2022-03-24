# [@stoplight/spectral-rulesets-v1.7.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.6.0...@stoplight/spectral-rulesets-v1.7.0) (2022-03-24)


### Features

* **rulesets:** add unused components server rule ([#2097](https://github.com/stoplightio/spectral/issues/2097)) ([71b312e](https://github.com/stoplightio/spectral/commit/71b312e34c85d8b4255832757b4b5afa8c5062a5))

# [@stoplight/spectral-rulesets-v1.6.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.5.2...@stoplight/spectral-rulesets-v1.6.0) (2022-03-03)


### Features

* **rulesets:** validate API security in oas-operation-security-defined ([#2046](https://github.com/stoplightio/spectral/issues/2046)) ([5540250](https://github.com/stoplightio/spectral/commit/5540250035f0df290eb0cb0106606a2918471ec5))

# [@stoplight/spectral-rulesets-v1.5.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.5.1...@stoplight/spectral-rulesets-v1.5.2) (2022-02-28)


### Bug Fixes

* **rulesets:** __importDefault undefined ([fdd647b](https://github.com/stoplightio/spectral/commit/fdd647b36b8d05c264b2320f0c8ea108e587d686))

# [@stoplight/spectral-rulesets-v1.5.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.5.0...@stoplight/spectral-rulesets-v1.5.1) (2022-02-28)


### Bug Fixes

* **rulesets:** __importDefault undefined ([c123bdf](https://github.com/stoplightio/spectral/commit/c123bdf1dfe4d303bf477dc5c211e5b09bb37ed6))

# [@stoplight/spectral-rulesets-v1.5.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.4.3...@stoplight/spectral-rulesets-v1.5.0) (2022-02-24)

### Features

- **rulesets:** support 2.1.0, 2.2.0, 2.3.0 AsyncAPI versions ([#2067](https://github.com/stoplightio/spectral/issues/2067)) ([2f1d7bf](https://github.com/stoplightio/spectral/commit/2f1d7bf31010bc91102d844bf4279a784cad2d67))

# [@stoplight/spectral-rulesets-v1.4.3](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.4.2...@stoplight/spectral-rulesets-v1.4.3) (2022-02-14)

### Bug Fixes

- simplify schema used in duplicated-entry-in-enum ([#2055](https://github.com/stoplightio/spectral/issues/2055)) ([8451774](https://github.com/stoplightio/spectral/commit/8451774db0fb0b97ba41d631641c8bcc562771a8))

# [@stoplight/spectral-rulesets-v1.4.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.4.1...@stoplight/spectral-rulesets-v1.4.2) (2022-02-07)

### Bug Fixes

- operation-tags should fail on empty array ([#2050](https://github.com/stoplightio/spectral/issues/2050)) ([a4c421f](https://github.com/stoplightio/spectral/commit/a4c421f585a2bb172b4e4dbfe94f7f9cad895905))

# [@stoplight/spectral-rulesets-v1.4.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.4.0...@stoplight/spectral-rulesets-v1.4.1) (2022-02-01)

### Bug Fixes

- add scopes to required in oauth2 security schemes ([#2035](https://github.com/stoplightio/spectral/issues/2035)) ([7090de0](https://github.com/stoplightio/spectral/commit/7090de0141ae43af84e3a90af9042defef96162c))

# [@stoplight/spectral-rulesets-v1.4.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.3.2...@stoplight/spectral-rulesets-v1.4.0) (2022-01-28)

### Features

- aliases take only array-ish given ([#2033](https://github.com/stoplightio/spectral/issues/2033)) ([263dc20](https://github.com/stoplightio/spectral/commit/263dc20581c3c24c2903f5522d8b212d15c01df6))

# [@stoplight/spectral-rulesets-v1.3.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.3.1...@stoplight/spectral-rulesets-v1.3.2) (2022-01-12)

### Bug Fixes

- update dependencies ([#2020](https://github.com/stoplightio/spectral/issues/2020)) ([5ec7b57](https://github.com/stoplightio/spectral/commit/5ec7b57c62638df8390584bffc977a3eb461ccc0))

# [@stoplight/spectral-rulesets-v1.3.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.3.0...@stoplight/spectral-rulesets-v1.3.1) (2021-12-22)

### Performance Improvements

- simplify JSONPath expressions ([#1986](https://github.com/stoplightio/spectral/issues/1986)) ([fae210f](https://github.com/stoplightio/spectral/commit/fae210f50dc23c3d94132a75897c8c4bd429ae38))

# [@stoplight/spectral-rulesets-v1.3.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.7...@stoplight/spectral-rulesets-v1.3.0) (2021-11-02)

### Features

- add validation rule for oas2 discriminator ([#1921](https://github.com/stoplightio/spectral/issues/1921)) ([f4e172e](https://github.com/stoplightio/spectral/commit/f4e172ec8f6c2827262a961051dfbeb48d69e812))

# [@stoplight/spectral-rulesets-v1.2.7](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.6...@stoplight/spectral-rulesets-v1.2.7) (2021-10-25)

### Bug Fixes

- exclusiveMinimum must be a number thrown for OAS 3.0 ([#1913](https://github.com/stoplightio/spectral/issues/1913)) ([65d287a](https://github.com/stoplightio/spectral/commit/65d287a2c9f770aa00e1f92406188770a6edfba0))
- variable not supported in server url within OAS 3.1 ([#1914](https://github.com/stoplightio/spectral/issues/1914)) ([c4f6762](https://github.com/stoplightio/spectral/commit/c4f6762b4e2c70a618671726d38c4a1afb9fd99c))

# [@stoplight/spectral-rulesets-v1.2.6](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.5...@stoplight/spectral-rulesets-v1.2.6) (2021-10-19)

### Bug Fixes

- support matrix parameter style for openapi3 ([#1864](https://github.com/stoplightio/spectral/issues/1864)) ([44b59d5](https://github.com/stoplightio/spectral/commit/44b59d5fab7bd8c905995202c644bb4b56577404)), closes [#1863](https://github.com/stoplightio/spectral/issues/1863)

# [@stoplight/spectral-rulesets-v1.2.5](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.4...@stoplight/spectral-rulesets-v1.2.5) (2021-10-07)

### Performance Improvements

- do not use schema fn in typedEnum ([#1846](https://github.com/stoplightio/spectral/issues/1846)) ([d44cf53](https://github.com/stoplightio/spectral/commit/d44cf53992fc8386a7bf6bfa308a43b698c9ee14))
- redundant traversal in oasSchema ([#1847](https://github.com/stoplightio/spectral/issues/1847)) ([ffe2dd5](https://github.com/stoplightio/spectral/commit/ffe2dd5307176ca7c57a7b3467756711eade5e45))

# [@stoplight/spectral-rulesets-v1.2.4](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.3...@stoplight/spectral-rulesets-v1.2.4) (2021-09-01)

### Bug Fixes

- operation-success-response rule does not respect 2XX and 3XX ([#1793](https://github.com/stoplightio/spectral/issues/1793)) ([b5c6a8f](https://github.com/stoplightio/spectral/commit/b5c6a8fa5bb1918a19235fcf77a1daa73b949a97))

# [@stoplight/spectral-rulesets-v1.2.3](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.2...@stoplight/spectral-rulesets-v1.2.3) (2021-08-28)

### Bug Fixes

- oasExample not handling boolean-ish required ([#1781](https://github.com/stoplightio/spectral/issues/1781)) ([9bf2ce4](https://github.com/stoplightio/spectral/commit/9bf2ce49ef659a6ec86f2c48c5541f14f2d65ecf))

# [@stoplight/spectral-rulesets-v1.2.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.1...@stoplight/spectral-rulesets-v1.2.2) (2021-08-19)

### Bug Fixes

- oasSchema not using correct dialect for OAS 3.1 ([#1774](https://github.com/stoplightio/spectral/issues/1774)) ([4eda7a4](https://github.com/stoplightio/spectral/commit/4eda7a40730e9ef4f78733314a9ccded2cc9f192))

# [@stoplight/spectral-rulesets-v1.2.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.2.0...@stoplight/spectral-rulesets-v1.2.1) (2021-07-09)

### Bug Fixes

- relax deps ([ca55521](https://github.com/stoplightio/spectral/commit/ca555210b7c50229c6f8cd0ae9e4e83dedb15083))

# [@stoplight/spectral-rulesets-v1.2.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.1.0...@stoplight/spectral-rulesets-v1.2.0) (2021-07-09)

### Features

- **parsers:** initial release ([#1739](https://github.com/stoplightio/spectral/issues/1739)) ([42064b0](https://github.com/stoplightio/spectral/commit/42064b04887616e863f2da27cd19b4cdcc35c0a3))

# [@stoplight/spectral-rulesets-v1.1.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-rulesets-v1.0.0...@stoplight/spectral-rulesets-v1.1.0) (2021-07-09)

### Features

- **core:** use double quotes in errors reported by Ajv ([#1718](https://github.com/stoplightio/spectral/issues/1718)) ([dd2a166](https://github.com/stoplightio/spectral/commit/dd2a166eff5e11c830d44f33bfc928e06a5c33f7))
- **rulesets:** more consistent messages in OAS ruleset ([#1713](https://github.com/stoplightio/spectral/issues/1713)) ([2899777](https://github.com/stoplightio/spectral/commit/2899777c2bfb2eb0bbfacfa9bea7a0fcbe144be9))

# @stoplight/spectral-rulesets-v1.0.0 (2021-07-07)

### Features

- more consistent messages in AsyncAPI ruleset ([#1714](https://github.com/stoplightio/spectral/issues/1714)) ([514bb28](https://github.com/stoplightio/spectral/commit/514bb28864e3a0d9b59aa5df7d70feb04aa7d903))
