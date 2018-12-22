spectral
========

Spectral CLI

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
$ npm install -g spectral
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
* [`spectral hello [FILE]`](#spectral-hello-file)
* [`spectral help [COMMAND]`](#spectral-help-command)

## `spectral hello [FILE]`

describe the command here

```
USAGE
  $ spectral hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ spectral hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/stoplightio/spectral/blob/v0.0.0/src/commands/hello.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_
<!-- commandsstop -->
