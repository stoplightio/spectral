# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
