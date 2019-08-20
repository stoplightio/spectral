import { writeFile } from 'fs';
import { promisify } from 'util';
import { CommandModule } from 'yargs';

import { IRuleResult } from '../..';
import { json, stylish } from '../../formatters';
import { getDefaultRulesetFile } from '../../rulesets/loader';
import { RuleCollection } from '../../types';
import { ILintConfig, OutputFormat } from '../../types/config';
import { lint, loadRulesets } from '../services/linter';

const writeFileAsync = promisify(writeFile);

const lintCommand: CommandModule = {
  describe: 'lint a JSON/YAML document from a file or URL',
  command: `lint <document>`,
  builder: yargs =>
    yargs
      .positional('document', {
        description: 'Location of a JSON/YAML document. Can be either a file or a fetchable resource on the web.',
        type: 'string',
      })
      .fail(() => {
        yargs.showHelp();
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
          array: true,
          type: 'string',
        },
        'skip-rule': {
          alias: 's',
          description: 'ignore certain rules if they are causing trouble',
          array: true,
          type: 'string',
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

  handler: async args => {
    const { document, encoding, format, output, ruleset, quiet, verbose } = (args as unknown) as ILintConfig & {
      document: string;
    };

    try {
      const cwd = process.cwd();
      const rulesetFile = ruleset || (await getDefaultRulesetFile(cwd));

      let rules: RuleCollection = {};
      if (!(rulesetFile === null || rulesetFile.length === 0)) {
        rules = await loadRulesets(cwd, rulesetFile);
      }

      const config = { encoding, format, ruleset, quiet, verbose };
      const results = await lint(document, config, rules);

      const formattedOutput = await formatOutput(results, format);
      await writeOutput(formattedOutput, output);

      process.exitCode = 1;
    } catch (err) {
      fail(err);
    }
  },
};

function fail(err: Error): void {
  console.error(err);
  process.exit(2);
}

async function formatOutput(results: IRuleResult[], format: OutputFormat): Promise<string> {
  return {
    json: () => json(results),
    stylish: () => stylish(results),
  }[format]();
}

async function writeOutput(outputStr: string, outputFile?: string) {
  if (outputFile) {
    return writeFileAsync(outputFile, outputStr);
  }
  console.log(outputStr);
}

export default lintCommand;
