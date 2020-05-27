#!/usr/bin/env node

import * as yargs from 'yargs';

import { DEFAULT_REQUEST_OPTIONS } from '../request';
import lintCommand from './commands/lint';

if (process.env.PROXY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ProxyAgent = require('proxy-agent');
  DEFAULT_REQUEST_OPTIONS.agent = new ProxyAgent(process.env.PROXY);
}

export default yargs
  .scriptName('spectral')
  .parserConfiguration({
    'camel-case-expansion': true,
  })
  .version()
  .help(true)
  .strict()
  .wrap(yargs.terminalWidth())
  .command(lintCommand)
  .demandCommand(1, '').argv;
