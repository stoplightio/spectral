#!/usr/bin/env node

import * as yargs from 'yargs';

import { DEFAULT_REQUEST_OPTIONS } from '@stoplight/spectral-runtime';
import lintCommand from './commands/lint';

if (typeof process.env.PROXY === 'string') {
  const { protocol } = new URL(process.env.PROXY);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent') as typeof import('hpagent');
  DEFAULT_REQUEST_OPTIONS.agent = new (protocol === 'https:' ? HttpsProxyAgent : HttpProxyAgent)({
    proxy: process.env.PROXY,
  });
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
