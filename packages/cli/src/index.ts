#!/usr/bin/env node

import * as yargs from 'yargs';

import { DEFAULT_REQUEST_OPTIONS } from '@stoplight/spectral-runtime';
import lintCommand from './commands/lint';

if (typeof process.env.PROXY === 'string') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent') as typeof import('hpagent');
  const httpAgent = new HttpProxyAgent({ proxy: process.env.PROXY });
  const httpsAgent = new HttpsProxyAgent({ proxy: process.env.PROXY });

  DEFAULT_REQUEST_OPTIONS.agent = url => (url.protocol === 'http:' ? httpAgent : httpsAgent);
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
