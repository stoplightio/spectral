import * as yargs from 'yargs';

import lintCommand from './commands/lint';

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
