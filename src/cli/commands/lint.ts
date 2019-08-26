import { CommandModule, showHelp } from 'yargs';

import { getDefaultRulesetFile } from '../../rulesets/loader';
import { ILintConfig, OutputFormat } from '../../types/config';
import { IRuleset } from '../../types/ruleset';
import { lint, loadRulesets } from '../services/linter';
import { formatOutput, writeOutput } from '../services/output';

const lintCommand: CommandModule = {
  describe: 'Start a mock server with the given spec file',
  command: 'lint <document>',
  builder: yargs =>
    yargs
      .positional('document', {
        description: 'Location of a JSON/YAML document. Can be either a file or a fetchable resource on the web.',
        type: 'string',
      })
      .usage('boo')
      .fail(() => {
        showHelp();
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

    showHelp('error');

    try {
      const cwd = process.cwd();
      const rulesetFile = ruleset || (await getDefaultRulesetFile(cwd));

      let loadedRuleset: IRuleset = {
        functions: {},
        rules: {},
      };

      if (!(rulesetFile === null || rulesetFile.length === 0)) {
        loadedRuleset = await loadRulesets(cwd, rulesetFile);
      }

      const config = { encoding, format, ruleset, quiet, verbose };
      const results = await lint(document, config, loadedRuleset);

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

export default lintCommand;
