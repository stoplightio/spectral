import { Dictionary } from '@stoplight/types';
import { pick } from 'lodash';
import { ReadStream } from 'tty';
import type { CommandModule } from 'yargs';

import { getDiagnosticSeverity, IRuleResult } from '@stoplight/spectral-core';
import { lint } from '../services/linter';
import { formatOutput, writeOutput } from '../services/output';
import { FailSeverity, ILintConfig, OutputFormat } from '../services/config';

const formatOptions = Object.values(OutputFormat);

const lintCommand: CommandModule = {
  describe: 'lint JSON/YAML documents from files or URLs',
  command: 'lint [documents..]',
  builder: yargs =>
    yargs
      .strict()
      .positional('documents', {
        description:
          'Location of JSON/YAML documents. Can be either a file, a glob or fetchable resource(s) on the web.',
        coerce(values) {
          if (Array.isArray(values) && values.length > 0) {
            return values as unknown[];
          }

          // https://stackoverflow.com/questions/39801643/detect-if-node-receives-stdin
          // https://twitter.com/MylesBorins/status/782009479382626304
          // https://nodejs.org/dist/latest/docs/api/tty.html#tty_readstream_istty
          if (process.stdin.isTTY) {
            return [];
          }

          return [(process.stdin as ReadStream & { fd: 0 }).fd];
        },
      })
      .check((argv: Dictionary<unknown>) => {
        if (argv.format !== void 0 && !(formatOptions as string[]).includes(String(argv.format))) {
          throw new TypeError('Unspecified format');
        }

        if (!Array.isArray(argv.documents) || argv.documents.length === 0) {
          throw new TypeError('No documents provided.');
        }

        return true;
      })
      .options({
        encoding: {
          alias: 'e',
          description: 'text encoding to use',
          type: 'string',
          default: 'utf8',
          choices: ['utf8', 'ascii', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'latin1'],
        },
        format: {
          alias: 'f',
          description: 'formatter to use for outputting results',
          choices: formatOptions,
          default: OutputFormat.STYLISH,
          type: 'string',
        },
        output: {
          alias: 'o',
          description: 'output to a file instead of stdout',
          type: 'string',
        },
        resolver: {
          description: 'path to custom json-ref-resolver instance',
          type: 'string',
        },
        ruleset: {
          alias: 'r',
          description: 'path/URL to a ruleset file',
          type: 'string',
        },
        'fail-severity': {
          alias: 'F',
          description: 'results of this level or above will trigger a failure exit code',
          choices: ['error', 'warn', 'info', 'hint'],
          default: 'error',
          type: 'string',
        },
        'display-only-failures': {
          alias: 'D',
          description: 'only output results equal to or greater than --fail-severity',
          type: 'boolean',
          default: false,
        },
        'ignore-unknown-format': {
          description: 'do not warn about unmatched formats',
          type: 'boolean',
          default: false,
        },
        'fail-on-unmatched-globs': {
          description: 'fail on unmatched glob patterns',
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
      ignoreUnknownFormat,
      failOnUnmatchedGlobs,
      ...config
    } = args as unknown as ILintConfig & {
      documents: Array<number | string>;
      failSeverity: FailSeverity;
      displayOnlyFailures: boolean;
    };

    return lint(documents, {
      format,
      output,
      encoding,
      ignoreUnknownFormat,
      failOnUnmatchedGlobs,
      ruleset,
      ...pick<Partial<ILintConfig>, keyof ILintConfig>(config, ['verbose', 'quiet', 'resolver']),
    })
      .then(results => {
        if (displayOnlyFailures) {
          return filterResultsBySeverity(results, failSeverity);
        }
        return results;
      })
      .then(results => {
        if (results.length > 0) {
          process.exitCode = severeEnoughToFail(results, failSeverity) ? 1 : 0;
        } else if (config.quiet !== true) {
          console.log(`No results with a severity of '${failSeverity}' or higher found!`);
        }
        const formattedOutput = formatOutput(results, format, { failSeverity: getDiagnosticSeverity(failSeverity) });
        return writeOutput(formattedOutput, output);
      })
      .catch(fail);
  },
};

const fail = ({ message }: Error): void => {
  console.error(message);
  process.exitCode = 2;
};

const filterResultsBySeverity = (results: IRuleResult[], failSeverity: FailSeverity): IRuleResult[] => {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  return results.filter(r => r.severity <= diagnosticSeverity);
};

export const severeEnoughToFail = (results: IRuleResult[], failSeverity: FailSeverity): boolean => {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  return results.some(r => r.severity <= diagnosticSeverity);
};

export default lintCommand;
