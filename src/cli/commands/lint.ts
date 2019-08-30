import { Dictionary } from '@stoplight/types';
import { CommandModule, showHelp } from 'yargs';

import { pick } from 'lodash';
import { ILintConfig, OutputFormat } from '../../types/config';
import { lint } from '../services/linter';
import { formatOutput, writeOutput } from '../services/output';

const toArray = (args: unknown) => (Array.isArray(args) ? args : [args]);

const lintCommand: CommandModule = {
  describe: 'lint a JSON/YAML document from a file or URL',
  command: 'lint <document>',
  builder: yargs =>
    yargs
      .positional('document', {
        description: 'Location of a JSON/YAML document. Can be either a file or a fetchable resource on the web.',
        type: 'string',
      })
      .fail(() => {
        showHelp();
      })
      .check((argv: Dictionary<unknown>) => {
        if (argv.format !== void 0 && argv.format !== OutputFormat.JSON && argv.format !== OutputFormat.STYLISH) {
          return false;
        }

        return true;
      })
      .options({
        encoding: {
          alias: 'e',
          description: 'text encoding to use',
          type: 'string',
          default: 'utf8',
        },
        format: {
          alias: 'f',
          description: 'formatter to use for outputting results',
          options: [OutputFormat.STYLISH, OutputFormat.JSON],
          default: OutputFormat.STYLISH,
          type: 'string',
        },
        output: {
          alias: 'o',
          description: 'output to a file instead of stdout',
          type: 'string',
        },
        ruleset: {
          alias: 'r',
          description: 'path/URL to a ruleset file',
          type: 'string',
          coerce: toArray,
        },
        'skip-rule': {
          alias: 's',
          description: 'ignore certain rules if they are causing trouble',
          type: 'string',
          coerce: toArray,
        },
        verbose: {
          alias: 'v',
          description: 'increase verbosity',
          type: 'boolean',
        },
        quiet: {
          alias: 'q',
          description: 'no logging - output only',
          type: 'boolean',
        },
      }),

  handler: args => {
    const { document, ruleset, format, output, encoding, ...config } = (args as unknown) as ILintConfig & {
      document: string;
    };

    return lint(
      document,
      { format, output, encoding, ...pick(config, ['ruleset', 'skipRule', 'verbose', 'quiet']) },
      ruleset,
    )
      .then(results => {
        if (results.length) {
          process.exitCode = 1;
        } else if (!config.quiet) {
          console.log('No errors or warnings found!');
        }
        const formattedOutput = formatOutput(results, format);
        return writeOutput(formattedOutput, output);
      })
      .catch(fail);
  },
};

function fail(err: Error) {
  console.error(err);
  process.exitCode = 2;
}

export default lintCommand;
