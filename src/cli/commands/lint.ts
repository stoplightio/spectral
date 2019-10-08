import { Dictionary } from '@stoplight/types';
import { CommandModule, showHelp } from 'yargs';

import { pick } from 'lodash';
import { getDiagnosticSeverity } from '../../rulesets/severity';
import { IRuleResult } from '../../types';
import { FailSeverity, ILintConfig, OutputFormat } from '../../types/config';
import { lint } from '../services/linter';
import { formatOutput, writeOutput } from '../services/output';

const toArray = (args: unknown) => (Array.isArray(args) ? args : [args]);

const formatOptions = Object.values(OutputFormat);

const lintCommand: CommandModule = {
  describe: 'lint JSON/YAML documents from files or URLs',
  command: 'lint <documents..>',
  builder: yargs =>
    yargs
      .positional('documents', {
        description:
          'Location of JSON/YAML documents. Can be either a file, a glob or fetchable resource(s) on the web.',
        type: 'string',
      })
      .fail(() => {
        showHelp();
      })
      .check((argv: Dictionary<unknown>) => {
        if (argv.format !== void 0 && !(formatOptions as string[]).includes(String(argv.format))) {
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
          options: formatOptions,
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
        'fail-severity': {
          alias: 'F',
          description: 'results of this level or above will trigger a failure exit code',
          choices: ['error', 'warn', 'info', 'hint'],
          default: 'hint', // TODO: BREAKING: raise this to warn in 5.0
          type: 'string',
        },
        'display-only-failures': {
          alias: 'D',
          description: 'only output results equal to or greater than --fail-severity',
          type: 'boolean',
          default: false,
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
    const {
      documents,
      failSeverity,
      displayOnlyFailures,
      ruleset,
      format,
      output,
      encoding,
      ...config
    } = (args as unknown) as ILintConfig & {
      documents: string[];
      failSeverity: FailSeverity;
      displayOnlyFailures: boolean;
    };

    return lint(documents, { format, output, encoding, ruleset, ...pick(config, ['skipRule', 'verbose', 'quiet']) })
      .then(results => {
        if (displayOnlyFailures) {
          return filterResultsBySeverity(results, failSeverity);
        }
        return results;
      })
      .then(results => {
        if (results.length) {
          process.exitCode = severeEnoughToFail(results, failSeverity) ? 1 : 0;
        } else if (!config.quiet) {
          console.log(`No results with a severity of '${failSeverity}' or higher found!`);
        }
        const formattedOutput = formatOutput(results, format);
        return writeOutput(formattedOutput, output);
      })
      .catch(fail);
  },
};

const fail = (err: Error) => {
  console.error(err);
  process.exitCode = 2;
};

const filterResultsBySeverity = (results: IRuleResult[], failSeverity: FailSeverity): IRuleResult[] => {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  return results.filter(r => r.severity <= diagnosticSeverity);
};

const severeEnoughToFail = (results: IRuleResult[], failSeverity: FailSeverity): boolean => {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  return results.some(r => r.severity <= diagnosticSeverity);
};

export default lintCommand;
