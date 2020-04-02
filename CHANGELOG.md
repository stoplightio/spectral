<!-- markdown-link-check-disable -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.3.0] - 2019-04-01

### Added
- Built-in functions can now be accessed from custom functions [#925](https://github.com/stoplightio/spectral/pull/925)
- CLI: `--show-unmatched-globs` flag  [#747](https://github.com/stoplightio/spectral/issues/747)

### Changed
- `typed-enum` function is a part of the OpenAPI ruleset [#924](https://github.com/stoplightio/spectral/issues/924)
- `openapi-tags` rule has been fixed to make it fit its description [#1038](https://github.com/stoplightio/spectral/pull/1038)

### Fixed
- Ruleset exceptions used to slip certain errors through cracks [#1018](https://github.com/stoplightio/spectral/issues/1018)
- Correct misleading `info-license` message [#1031](https://github.com/stoplightio/spectral/pull/1031)
- Requiring packages located under node_modules is possible [#1029](https://github.com/stoplightio/spectral/pull/1029)
- Set proper document source if legacy parsed result is given [#1040](https://github.com/stoplightio/spectral/pull/1040)

## [5.2.0] - 2019-03-18

### Added
- Rule exceptions are supported [#747](https://github.com/stoplightio/spectral/issues/747)
- Allow require calls in Node.JS [#1011](https://github.com/stoplightio/spectral/pull/1011)

### Changed
- YAMLIncompatibleValue diagnostics are now considered warnings [#1009](https://github.com/stoplightio/spectral/pull/1009) 

### Fixed
- Alphabetical rule works correctly for $refs [#979](https://github.com/stoplightio/spectral/issues/979)

## [5.1.0] - 2019-02-26

### Added 
- Implement a new `typed-enum` rule to detect enum value that do not respect specified type [#913](https://github.com/stoplightio/spectral/pull/913)
- API: introduced document [#876](https://github.com/stoplightio/spectral/pull/876) - note, this is **not** a breaking change
- Introduce optional enhancers to casing function [#884](https://github.com/stoplightio/spectral/pull/884)

### Fixed
- Improved Example Object validation [#882](https://github.com/stoplightio/spectral/pull/882)
- `oas3-operation-security-defined` rule supports optional authentication [#895](https://github.com/stoplightio/spectral/pull/895)
- Generate more correct paths when reporting an error [#900](https://github.com/stoplightio/spectral/pull/900)
- `example-value-or-externalValue` no longer reports false positives [#899](https://github.com/stoplightio/spectral/pull/899)
- `schema-path` accepts a JSON Path expression as a field selector [#917](https://github.com/stoplightio/spectral/pull/917) 
- `schema-path` handles invalid values gracefully [#917](https://github.com/stoplightio/spectral/pull/917) 
- `oas3-valid-(content-)schema-example` rules handle nullable correctly [#914](https://github.com/stoplightio/spectral/pull/914)

## [5.0.0] - 2019-12-24

### Added
- Alphabetical rule function now supports numeric keys [#730](https://github.com/stoplightio/spectral/issues/730)
- Non-JSON-ish YAML mapping keys are reported [#726](https://github.com/stoplightio/spectral/issues/726)
- CLI: new formatter - text [#822](https://github.com/stoplightio/spectral/issues/822)
- CLI: new formatter - teamcity [#823](https://github.com/stoplightio/spectral/issues/823)
- CLI: new formatter - HTML [#389](https://github.com/stoplightio/spectral/issues/389)
- CLI: custom resolver can be provided leveraging --resolver flag [#717](https://github.com/stoplightio/spectral/issues/717)
- CLI: input can be provided via STDIN [#757](https://github.com/stoplightio/spectral/issues/757)
- Implement ignoreUnsupportedFormats to make it easier to detect unrecognized formats [#678](https://github.com/stoplightio/spectral/issues/678)
- Rule's Given can be an array now [#799](https://github.com/stoplightio/spectral/pull/799)
- Casing built-in function is added [#564](https://github.com/stoplightio/spectral/issues/564)
- New oas rule - `operation-tag-defined` [#704](https://github.com/stoplightio/spectral/pull/704)

### Changed
- BREAKING: The oas2 and oas3 rulesets have been merged into a single oas ruleset [#773](https://github.com/stoplightio/spectral/pull/773)
- BREAKING: Deprecated Spectral#addRules and Spectral#addFunctions have been removed [#561](https://github.com/stoplightio/spectral/issues/561)
- BREAKING: Some oas rules, such as `example-value-or-externalValue` and `openapi-tags`, are now included in the recommended rulset [#725](https://github.com/stoplightio/spectral/issues/725) [#706](https://github.com/stoplightio/spectral/pull/706)
- BREAKING: The `model-description` and `operation-summary-formatted` rules have been removed [#725](https://github.com/stoplightio/spectral/issues/725)
- BREAKING: The `when` rule property has been removed [#585](https://github.com/stoplightio/spectral/issues/585)
- BREAKING: Rules are set to recommended by default [#719](https://github.com/stoplightio/spectral/pull/719)
- Improved error source detection [#685](https://github.com/stoplightio/spectral/pull/685)
- Error paths point at unresolved document [#839](https://github.com/stoplightio/spectral/pull/839)
- Validation messages contain more consistent error paths [#867](https://github.com/stoplightio/spectral/pull/867)
- CLI: Default `--fail-severity` is now `error`, so getting a  `warn`, `info` or a `hint` will not return a exit status code [#706](https://github.com/stoplightio/spectral/pull/706)
- Rulesets no longer require a `rules` property [#652](https://github.com/stoplightio/spectral/pull/652)

### Fixed
- Circular remote references with JSON pointers are resolved correctly [json-ref-resolver#141](https://github.com/stoplightio/json-ref-resolver/pull/141)
- Local root JSON pointers are resolved correctly [json-ref-resolver#146](https://github.com/stoplightio/json-ref-resolver/pull/146) 
- Invalid JSON pointers are reported as errors now [json-ref-resolver#140](https://github.com/stoplightio/json-ref-resolver/pull/140) and [json-ref-resolver#147](https://github.com/stoplightio/json-ref-resolver/pull/147)
- Unixify glob patterns under Windows [#679](https://github.com/stoplightio/spectral/issues/679)
- Improved duplicate keys detection [#751](https://github.com/stoplightio/spectral/issues/751)
- Spectral should be usable in browsers with no crypto module available [#846](https://github.com/stoplightio/spectral/pull/846)
- Falsy values are printed in validation messages [#824](https://github.com/stoplightio/spectral/pull/824)
- Validation results are no longer duplicate [#680](https://github.com/stoplightio/spectral/issues/680), [#737](https://github.com/stoplightio/spectral/pull/737) and [#856](https://github.com/stoplightio/spectral/pull/856)

## [4.2.0] - 2019-10-08

### Added
- CLI: glob patterns and multiple paths are allowed [#534](https://github.com/stoplightio/spectral/issues/534)
- CLI: control fail severity and result display [#368](https://github.com/stoplightio/spectral/issues/368)
- CLI: new formatter - JUnit [#478](https://github.com/stoplightio/spectral/issues/478)
- CLI: add possibility to proxy requests [#446](https://github.com/stoplightio/spectral/issues/446)
- Built-in ruleset formats targeting JSON Schema files [#571](https://github.com/stoplightio/spectral/issues/571)
- `{{value}}` and `{{path}}` can be used in messages [#520](https://github.com/stoplightio/spectral/issues/520) [#572](https://github.com/stoplightio/spectral/issues/572)

### Deprecated
- `when` Rule property is deprecated [#585](https://github.com/stoplightio/spectral/issues/585) 

### Changed
- Validation results produced by `alphabetical` function are more meaningful [#613](https://github.com/stoplightio/spectral/pull/613)
- Enhanced JSON Schema enum validation [#579](https://github.com/stoplightio/spectral/pull/579) 
- Improved messages generated by `oasPathParam` function [#537](https://github.com/stoplightio/spectral/issues/537) 
- CLI: the amount of enabled rules is now displayed if you run Spectral with `--verbose` flag [#435](https://github.com/stoplightio/spectral/issues/435)
- Stricter source matching for errors [#615](https://github.com/stoplightio/spectral/pull/615)

### Fixed
- `schema` function can validate falsy values [10e5d1c](https://github.com/stoplightio/spectral/commit/10e5d1c0262790ad8349e25b2e5517e7ae15402c)
- `schema` function can validate Draft 6 and Draft 7 JSON Schemas [ea2ddff](https://github.com/stoplightio/spectral/commit/ea2ddffd58a2a92f483147fec195e0a8fe80c07b)
- Parameters in links objects are not linted for not having a description property. [#272](https://github.com/stoplightio/spectral/issues/272)
- More accurate ranges for errors occurring in referenced files [6986b82](https://github.com/stoplightio/spectral/commit/6986b82bee725aa8733c2d07ccc65a99e14c22c6)
- CLI: stylish formatter reports `info` and `hint` severity levels correctly [#565](https://github.com/stoplightio/spectral/issues/565)

## [4.1.1] - 2019-09-05

### Fixed
CLI: missing tslib [#524](https://github.com/stoplightio/spectral/issues/524)

## [4.1.0] - 2019-09-04

### Added
- Rulesets can be loaded using `Spectral#loadRuleset` method
- Custom functions can be registered directly in rulesets
- Rulesets can be registered against document format
- New rules: no-$ref-siblings, oas2-anyOf, oas2-oneOf
- YAML's [merge keys](https://yaml.org/type/merge.html) are supported
- $refs can be used in rulesets
- Resolved document is accessible now if you use `Spectral#runWithResolved` method [#398](https://github.com/stoplightio/spectral/issues/398)

### Changed
- valid-example rule has been broken into smaller, more specific rules [#223](https://github.com/stoplightio/spectral/issues/223)
- YAML scalar values are parsed according to YAML 1.2 spec [#481](https://github.com/stoplightio/spectral/issues/481)
- We swapped oclif with yargs

### Deprecated
- `addRules` and `addFunctions` have been deprecated, use `setRules` and `setFunctions` instead
- Importing built-in ruleset in cjs/esm module way (via require or import) is no longer recommended. Consider using `#loadRuleset` instead

### Fixed
- CLI: relative paths to documents are supported [#474](https://github.com/stoplightio/spectral/issues/474)
- Improved path and ranges generation [#458](https://github.com/stoplightio/spectral/pull/458), [#459](https://github.com/stoplightio/spectral/pull/459)
- Unknown schema formats are no longer printed [#396](https://github.com/stoplightio/spectral/issues/396)
- Graceful handling of circular rulesets
- A few other minor issues

## [4.0.3] - 2019-08-26
### Fixed

- Resolve references to files with relative paths 

## [4.0.2] - 2019-07-31
### Fixed

- Tweaked JSON Path lookup for paths to avoid deep scan, speeding up linting for large documents [#413](https://github.com/stoplightio/spectral/pull/413)

## [4.0.1] - 2019-07-16
### Fixed

- NPM install for Windows users was failing due to a dependency not supporting Windows in their build script

## [4.0.0] - 2019-07-09
### Added

- Using the CLI with multiple, custom rulesets
- New syntax for rulesets, including overriding rules and extending rulesets
- More friendly errors and warnings
- CLI `--quiet` flag added to lint command, removing any output other than results
- CLI `--skip-rules` flag added to lint command, to ignore certain rules

### Changed

- CLI now reports errors and warnings for referenced (`$ref`) files

### Removed

- Configuration files were briefly available in 3.x but removed in v4.0
- CLI `--max-results` flag is removed

<!-- markdown-link-check-enable-->
