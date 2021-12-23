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
        if (!Array.isArray(argv.documents) || argv.documents.length === 0) {
          throw new TypeError('No documents provided.');
        }

        const formats = String(argv.format).split(',');
        if (!formats.every(f => (formatOptions as string[]).includes(f))) {
          throw new TypeError('Unspecified format');
        }

        if (formats.length > 1 && argv.output === void 0) {
          throw new TypeError('Outputs needed when more than one format is specified');
        }

        if (argv.output !== void 0) {
          const output = String(argv.output)
            .split(',')
            .map(out => out.split(/(?<=^[^:]+):/));

          if (output.length > 1 && !output.every(o => o.length == 2)) {
            throw new TypeError('With multiple outputs they should all specify a format');
          }

          if (formats.length > 1 && output[0].length == 1) {
            throw new TypeError('With multiple formats multiple outputs should be defined');
          }

          // multiple outputs should all contains the format part
          if (output.length > 1 && output.some(o => o.length != 2)) {
            throw new TypeError('Invalid output');
          }

          if ((output.length == 1 && output[0].length == 2) || output.length > 1) {
            // output formats should be specified
            if (!output.every(o => (formatOptions as string[]).includes(o[0]))) {
              throw new TypeError('Unspecified output format');
            }

            // output formats should all be given on --format flag
            const outputFormats = output.map(o => o[0]);
            if (!outputFormats.every(f => formats.includes(f))) {
              throw new TypeError('Output formats contain some unspecified format');
            }

            // only one output format can miss with respoect to formats (it goes to stdout)
            if (formats.filter(f => !outputFormats.includes(f)).length > 1) {
              throw new TypeError('Too few outputs defined');
            }
          }
        }

        return true;
      })
      .middleware((argv: Dictionary<unknown>) => {
        const format = String(argv.format).split(',');
        if (argv.output !== void 0) {
          let output = String(argv.output)
            .split(',')
            .map(out => out.split(/(?<=^[^:]+):/));

          if (output[0].length == 1) output = [[format[0], output[0][0]]];

          const outputObj: Dictionary<string> = Object.fromEntries(output);
          const stdout = format.find(f => !Object.keys(outputObj).includes(f));
          if (stdout !== undefined) outputObj[stdout] = 'stdout';
          argv.output = outputObj;
        } else {
          argv.output = { [format[0]]: 'stdout' };
        }
        argv.format = format;
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
          description: 'formatters to use for outputting results, more than one can be given joining them with a comma',
          default: OutputFormat.STYLISH,
          type: 'string',
        },
        output: {
          alias: 'o',
          description:
            "where to ouput results, can be a single file name, multiple '<format>:<filename>' strings joined by comma or missing for use stdout",
          type: 'string',
        },
        'stdin-filepath': {
          description: 'path to a file to pretend that stdin comes from',
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
      stdinFilepath,
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
      stdinFilepath,
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

        for (const [format, out] of Object.entries(output).sort(([f1, _o1], [f2, _o2]) =>
          f1 > f2 ? 1 : f1 == f2 ? 0 : -1,
        )) {
          const formattedOutput = formatOutput(results, format as OutputFormat, {
            failSeverity: getDiagnosticSeverity(failSeverity),
          });
          void writeOutput(formattedOutput, out == 'stdout' ? undefined : out);
        }
        return void 0;
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
