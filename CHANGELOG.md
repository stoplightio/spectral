# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
