## @stoplight/spectral-core [1.18.3](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-1.18.2...@stoplight/spectral-core-1.18.3) (2023-07-18)


### Bug Fixes

* **core:** pointer in overrides are applied too broadly ([#2511](https://github.com/stoplightio/spectral/issues/2511)) ([69403c1](https://github.com/stoplightio/spectral/commit/69403c1dc1dd78937bf4dbab3c392f03c76e2201))

## @stoplight/spectral-core [1.18.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-1.18.1...@stoplight/spectral-core-1.18.2) (2023-07-10)


### Bug Fixes

* **core:** dedupe paths containing special characters correctly ([758de21](https://github.com/stoplightio/spectral/commit/758de213aa9dd6319c832de54cfee31fe1b86649))

## @stoplight/spectral-core [1.18.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.18.0...@stoplight/spectral-core-1.18.1) (2023-07-07)


### Bug Fixes

* **core:** invalid then produced by Rule#toJSON ([#2496](https://github.com/stoplightio/spectral/issues/2496)) ([db91553](https://github.com/stoplightio/spectral/commit/db9155326289ef5c143353719fe71def84ca136e))

# [@stoplight/spectral-core-v1.18.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.17.0...@stoplight/spectral-core-v1.18.0) (2023-04-25)


### Bug Fixes

* **core:** more accurate ruleset error paths ([66b3ca7](https://github.com/stoplightio/spectral/commit/66b3ca704136d5d8a34211e72e2d8a2c522261e4))


### Features

* **core:** relax formats validation ([#2151](https://github.com/stoplightio/spectral/issues/2151)) ([de16b4c](https://github.com/stoplightio/spectral/commit/de16b4cbd56cd9836609ab79487a6e3e06df964d))

# [@stoplight/spectral-core-v1.17.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.16.1...@stoplight/spectral-core-v1.17.0) (2023-03-23)


### Features

* **core:** support x- extensions in the ruleset ([#2440](https://github.com/stoplightio/spectral/issues/2440)) ([964151e](https://github.com/stoplightio/spectral/commit/964151e73b6cc3c0b7c960eac3711ffbeac690ae))

# [@stoplight/spectral-core-v1.16.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.16.0...@stoplight/spectral-core-v1.16.1) (2023-01-31)


### Bug Fixes

* **core:** reset path in fn context ([#2389](https://github.com/stoplightio/spectral/issues/2389)) ([3d47ec4](https://github.com/stoplightio/spectral/commit/3d47ec432fde46d9d1e59d00c1173d924b6a39a1))

# [@stoplight/spectral-core-v1.16.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.15.2...@stoplight/spectral-core-v1.16.0) (2022-11-30)


### Features

* **core:** support end-user extensions in the rule definitions ([#2345](https://github.com/stoplightio/spectral/issues/2345)) ([365fced](https://github.com/stoplightio/spectral/commit/365fcedb7c140946767ed28a92a120b3adb08e47))

# [@stoplight/spectral-core-v1.15.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.15.1...@stoplight/spectral-core-v1.15.2) (2022-11-22)


### Bug Fixes

* **core:** improve deep ruleset inheritance ([#2326](https://github.com/stoplightio/spectral/issues/2326)) ([378b4b8](https://github.com/stoplightio/spectral/commit/378b4b89769635e8b45d5325c15cfa00881b70bd))

# [@stoplight/spectral-core-v1.15.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.15.0...@stoplight/spectral-core-v1.15.1) (2022-10-24)


### Bug Fixes

* **core:** support utf8 surrogates ([#2267](https://github.com/stoplightio/spectral/issues/2267)) ([a1bd6d2](https://github.com/stoplightio/spectral/commit/a1bd6d29b473aff257dbf66264ebdf471fae07cc))

# [@stoplight/spectral-core-v1.15.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.14.2...@stoplight/spectral-core-v1.15.0) (2022-10-14)


### Features

* **core:** include error codes in RulesetValidationError ([c01c6b5](https://github.com/stoplightio/spectral/commit/c01c6b587314337792597714ebd955b761a67649))

# [@stoplight/spectral-core-v1.14.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.14.1...@stoplight/spectral-core-v1.14.2) (2022-10-03)


### Bug Fixes

* **core:** async functions have undefined paths ([#2304](https://github.com/stoplightio/spectral/issues/2304)) ([df257b3](https://github.com/stoplightio/spectral/commit/df257b3c8f3fd5a169eee2d0013c6e346ab86178))

# [@stoplight/spectral-core-v1.14.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.14.0...@stoplight/spectral-core-v1.14.1) (2022-08-30)


### Performance Improvements

* **core:** bump jsonpath-plus to 7.1.0 ([#2259](https://github.com/stoplightio/spectral/issues/2259)) ([aacdcd7](https://github.com/stoplightio/spectral/commit/aacdcd77f0ff38c880f6292904449d0af5e7eed4))

# [@stoplight/spectral-core-v1.14.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.13.1...@stoplight/spectral-core-v1.14.0) (2022-08-24)


### Features

* **core:** improve alias validation ([#2164](https://github.com/stoplightio/spectral/issues/2164)) ([a15150a](https://github.com/stoplightio/spectral/commit/a15150a7b523fbcf1604359b26260f8bcda0ae62))

# [@stoplight/spectral-core-v1.13.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.13.0...@stoplight/spectral-core-v1.13.1) (2022-08-22)


### Bug Fixes

* **core:** bump @stoplight/better-ajv-errors from 1.0.1 to 1.0.3 ([7f9bcba](https://github.com/stoplightio/spectral/commit/7f9bcba147fb78329bcce1828df560849a0d342e))

# [@stoplight/spectral-core-v1.13.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.12.4...@stoplight/spectral-core-v1.13.0) (2022-08-03)


### Features

* **core:** improve validation ([#2026](https://github.com/stoplightio/spectral/issues/2026)) ([8315162](https://github.com/stoplightio/spectral/commit/83151628824592117d842a8965c9557841966b1a))

# [@stoplight/spectral-core-v1.12.4](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.12.3...@stoplight/spectral-core-v1.12.4) (2022-07-21)


### Bug Fixes

* **core:** fix 'resolved vs unresolved' json path mapping ([#2202](https://github.com/stoplightio/spectral/issues/2202)) ([157ec59](https://github.com/stoplightio/spectral/commit/157ec592d8b3276094284fead7a08541b3f46f61))

# [@stoplight/spectral-core-v1.12.3](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.12.2...@stoplight/spectral-core-v1.12.3) (2022-06-29)


### Bug Fixes

* **core:** bump nimma from 0.2.1 to 0.2.2 ([#2173](https://github.com/stoplightio/spectral/issues/2173)) ([65ba74f](https://github.com/stoplightio/spectral/commit/65ba74f6a681a8ad7a3cd3eec687544a3972b2b8))

# [@stoplight/spectral-core-v1.12.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.12.1...@stoplight/spectral-core-v1.12.2) (2022-05-18)


### Bug Fixes

* **core:** bump nimma from 0.2.0 to 0.2.1 ([#2157](https://github.com/stoplightio/spectral/issues/2157)) ([4d5ebeb](https://github.com/stoplightio/spectral/commit/4d5ebebb65cb8f6c44faa5b629311f5b25dd6bfe))

# [@stoplight/spectral-core-v1.12.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.12.0...@stoplight/spectral-core-v1.12.1) (2022-04-29)


### Bug Fixes

* **core:** redeclared rules should always be re-enabled ([#2138](https://github.com/stoplightio/spectral/issues/2138)) ([6def6be](https://github.com/stoplightio/spectral/commit/6def6be4bc3f318c8e93d2e1c0df2ff1b803a178))

# [@stoplight/spectral-core-v1.12.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.11.1...@stoplight/spectral-core-v1.12.0) (2022-04-18)


### Features

* **core:** support JSON ruleset validation ([#2062](https://github.com/stoplightio/spectral/issues/2062)) ([aeb7d5b](https://github.com/stoplightio/spectral/commit/aeb7d5b842741d85229fb2c8575ae2c58c8dfbb8))

# [@stoplight/spectral-core-v1.11.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.11.0...@stoplight/spectral-core-v1.11.1) (2022-03-16)


### Bug Fixes

* **core:** bump nimma from 0.1.8 to 0.2.0 ([#2088](https://github.com/stoplightio/spectral/issues/2088)) ([36ec40e](https://github.com/stoplightio/spectral/commit/36ec40e92abb6fe0ffbc104722599147dda555fb))

# [@stoplight/spectral-core-v1.11.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.10.2...@stoplight/spectral-core-v1.11.0) (2022-03-03)


### Features

* **cli:** improve error logging ([#2071](https://github.com/stoplightio/spectral/issues/2071)) ([b194368](https://github.com/stoplightio/spectral/commit/b194368164d92dce31b7ceba84ccc94fbe51f979))

# [@stoplight/spectral-core-v1.10.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.10.1...@stoplight/spectral-core-v1.10.2) (2022-02-24)

### Bug Fixes

- bump nimma from 0.1.7 to 0.1.8 ([#2058](https://github.com/stoplightio/spectral/issues/2058)) ([fb756f2](https://github.com/stoplightio/spectral/commit/fb756f2e582e533d79c1ac3ed5cef2e8f8b1b299))

# [@stoplight/spectral-core-v1.10.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.10.0...@stoplight/spectral-core-v1.10.1) (2022-02-14)

### Bug Fixes

- consider `message` when de-duplicating results ([#2052](https://github.com/stoplightio/spectral/issues/2052)) ([b07cc7b](https://github.com/stoplightio/spectral/commit/b07cc7b94e65277e1328e4511508db923330ab52))

# [@stoplight/spectral-core-v1.10.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.9.0...@stoplight/spectral-core-v1.10.0) (2022-01-28)

### Features

- aliases take only array-ish given ([#2033](https://github.com/stoplightio/spectral/issues/2033)) ([263dc20](https://github.com/stoplightio/spectral/commit/263dc20581c3c24c2903f5522d8b212d15c01df6))

# [@stoplight/spectral-core-v1.9.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.8.1...@stoplight/spectral-core-v1.9.0) (2022-01-19)

- support multiple JSONPath expressions for aliases ([#2016](https://github.com/stoplightio/spectral/issues/2016)) ([f1b2c2c](https://github.com/stoplightio/spectral/commit/f1b2c2c81dbf5a3ddec4d3b212b4b942d0a88055))

# [@stoplight/spectral-core-v1.8.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.8.0...@stoplight/spectral-core-v1.8.1) (2021-12-29)

### Bug Fixes

- update nimma & json-schema ([#2012](https://github.com/stoplightio/spectral/issues/2012)) ([67a6104](https://github.com/stoplightio/spectral/commit/67a6104d9283788462b1c4c229733d5371c041ca))

# [@stoplight/spectral-core-v1.8.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.7.0...@stoplight/spectral-core-v1.8.0) (2021-12-15)

### Features

- include 'description' for ruleset ([#2000](https://github.com/stoplightio/spectral/issues/2000)) ([aacae2c](https://github.com/stoplightio/spectral/commit/aacae2c6b037c5411247644bfb8b5eecea046a1d))

# [@stoplight/spectral-core-v1.7.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.6.1...@stoplight/spectral-core-v1.7.0) (2021-12-10)

### Features

- expose x-internal to annotate internal opts ([#1993](https://github.com/stoplightio/spectral/issues/1993)) ([0287319](https://github.com/stoplightio/spectral/commit/028731980892882a8ba637a76046bb5a42c92b79))

# [@stoplight/spectral-core-v1.6.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.6.0...@stoplight/spectral-core-v1.6.1) (2021-11-04)

### Bug Fixes

- fixed jsonpath expressions may occasionally yield incorrect results ([#1917](https://github.com/stoplightio/spectral/issues/1917)) ([1a5a227](https://github.com/stoplightio/spectral/commit/1a5a227d6319dcc2b1ad8cfefffe044a7a4b3cbc))

# [@stoplight/spectral-core-v1.6.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.5.1...@stoplight/spectral-core-v1.6.0) (2021-10-12)

### Features

- support scoped aliases ([#1840](https://github.com/stoplightio/spectral/issues/1840)) ([b278497](https://github.com/stoplightio/spectral/commit/b278497a414323dea433e48596aaa58abf269f5d))

# [@stoplight/spectral-core-v1.5.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.5.0...@stoplight/spectral-core-v1.5.1) (2021-09-14)

### Bug Fixes

- update nimma ([#1829](https://github.com/stoplightio/spectral/issues/1829)) ([4e8da71](https://github.com/stoplightio/spectral/commit/4e8da71a36526e51fae06be0a13db5dd77ad77d6))

# [@stoplight/spectral-core-v1.5.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.4.0...@stoplight/spectral-core-v1.5.0) (2021-09-06)

### Features

- hook-up nimma v2 ([#1785](https://github.com/stoplightio/spectral/issues/1785)) ([3af8b69](https://github.com/stoplightio/spectral/commit/3af8b69e21ac73493c7539ddb0b8970782fcd5ac))

# [@stoplight/spectral-core-v1.4.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.3.0...@stoplight/spectral-core-v1.4.0) (2021-08-19)

### Features

- expose underlying schemas in RulesetFunctionWithValidator ([#1777](https://github.com/stoplightio/spectral/issues/1777)) ([b591b55](https://github.com/stoplightio/spectral/commit/b591b55350c5182de0e5b45a4739a960ea63bbda))

# [@stoplight/spectral-core-v1.3.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.2.1...@stoplight/spectral-core-v1.3.0) (2021-07-15)

### Features

- serializable rulesets ([#1747](https://github.com/stoplightio/spectral/issues/1747)) ([3f0e842](https://github.com/stoplightio/spectral/commit/3f0e8421a9d6f83e8486dd48acbb406275924623))

# [@stoplight/spectral-core-v1.2.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.2.0...@stoplight/spectral-core-v1.2.1) (2021-07-09)

### Bug Fixes

- relax deps ([ca55521](https://github.com/stoplightio/spectral/commit/ca555210b7c50229c6f8cd0ae9e4e83dedb15083))

# [@stoplight/spectral-core-v1.2.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.1.0...@stoplight/spectral-core-v1.2.0) (2021-07-09)

### Features

- **parsers:** initial release ([#1739](https://github.com/stoplightio/spectral/issues/1739)) ([42064b0](https://github.com/stoplightio/spectral/commit/42064b04887616e863f2da27cd19b4cdcc35c0a3))

# [@stoplight/spectral-core-v1.1.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-core-v1.0.0...@stoplight/spectral-core-v1.1.0) (2021-07-09)

### Features

- use double quotes in errors reported by Ajv ([#1718](https://github.com/stoplightio/spectral/issues/1718)) ([dd2a166](https://github.com/stoplightio/spectral/commit/dd2a166eff5e11c830d44f33bfc928e06a5c33f7))

# @stoplight/spectral-core-v1.0.0 (2021-07-07)

### Bug Fixes

- incorrect range when semicolons are present in a key ([#1703](https://github.com/stoplightio/spectral/issues/1703)) ([195021e](https://github.com/stoplightio/spectral/commit/195021e69ba04cf23f0109f609c5ce6056614e7a))

### Features

- **cli:** demand some ruleset to be present ([#1699](https://github.com/stoplightio/spectral/issues/1699)) ([3baba29](https://github.com/stoplightio/spectral/commit/3baba292bd4f318b88299d6de9b75d021b508ace))
- respect pointers in overrides ([#1702](https://github.com/stoplightio/spectral/issues/1702)) ([9433b82](https://github.com/stoplightio/spectral/commit/9433b829d722aebc8a9a42fe327c21bba2a3b5e1))
- support overrides in rulesets ([#1684](https://github.com/stoplightio/spectral/issues/1684)) ([153d685](https://github.com/stoplightio/spectral/commit/153d68557da4bcffd6d2ed2261bcdb6a8324cdb5))
- support path aliases in rulesets ([#1692](https://github.com/stoplightio/spectral/issues/1692)) ([3a112b8](https://github.com/stoplightio/spectral/commit/3a112b85126f9c926c5c1efd084dda2b478d8c42))
- **ruleset-migrator:** implement ruleset migrator ([#1698](https://github.com/stoplightio/spectral/issues/1698)) ([efa5c50](https://github.com/stoplightio/spectral/commit/efa5c50ace565df089707a5196643d52cc82bad6))
