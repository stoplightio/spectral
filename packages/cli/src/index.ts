#!/usr/bin/env node

import * as yargs from 'yargs';

import { DEFAULT_REQUEST_OPTIONS } from '@stoplight/spectral-runtime';
import lintCommand from './commands/lint';
import type * as Agent from 'proxy-agent';

if (process.env.PROXY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ProxyAgent = require('proxy-agent') as typeof Agent;
  DEFAULT_REQUEST_OPTIONS.agent = new ProxyAgent(process.env.PROXY);
}

export default yargs
  .scriptName('spectral')
  .parserConfiguration({
    'camel-case-expansion': true,
  })
  .version()
  .help(true)
  .strictCommands()
  .strictOptions()
  .showHelpOnFail(true)
  .wrap(yargs.terminalWidth())
  .command(lintCommand)
  .demandCommand(1, '').argv;
