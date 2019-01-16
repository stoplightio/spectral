![Spectral logo](../../img/spectral-banner.png)

# Spectral CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/spectral.svg)](https://npmjs.org/package/spectral)
[![Downloads/week](https://img.shields.io/npm/dw/spectral.svg)](https://npmjs.org/package/spectral)
[![License](https://img.shields.io/npm/l/spectral.svg)](https://github.com/stoplightio/spectral/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ yarn add --global spectral
$ spectral COMMAND
running command...
$ spectral (-v|--version|version)
spectral/0.0.0 linux-x64 node-v10.12.0
$ spectral --help [COMMAND]
USAGE
  $ spectral COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`spectral lint [SOURCE]`](#spectral-lint-source)
* [`spectral help [COMMAND]`](#spectral-help-command)

## `spectral lint [SOURCE]`

describe the command here

```
USAGE
  $ spectral lint [SOURCE]

OPTIONS
  -e, --encoding=encoding  [default: utf8] text encoding to use
  -h, --help               show CLI help
  -m, --maxWarn=maxWarn    [default: all] maximum warnings to show
  -r, --resolve            resolve external $refs
  -v, --verbose            increase verbosity

EXAMPLE
  $ spectral lint ./openapi.yaml
  linting ./openapi.yaml
```

## `spectral help [COMMAND]`

display help for spectral

```
USAGE
  $ spectral help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

<!-- commandsstop -->
