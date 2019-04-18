import { Command, flags as flagHelpers } from '@oclif/command';
import { IParserResult } from '@stoplight/types';
import { getLocationForJsonPath } from '@stoplight/yaml';
import { resolve } from 'path';
import { readRuleset } from '../../config/reader';
import { readParsable } from '../../fs/reader';
import { oas2Functions, oas2Rules } from '../../rulesets/oas2';
import { oas3Functions, oas3Rules } from '../../rulesets/oas3';
import { Spectral } from '../../spectral';
import { IParsedResult, RuleCollection } from '../../types';
import { formatOutput, writeOutput } from '../utils/output';

export default class Lint extends Command {
  public static description = 'lint a JSON/YAML document from a file or URL';

  public static examples = [
    `$ spectral lint .openapi.yaml
linting ./openapi.yaml
`,
  ];

  public static flags = {
    help: flagHelpers.help({ char: 'h' }),
    encoding: flagHelpers.string({
      char: 'e',
      default: 'utf8',
      description: 'text encoding to use',
    }),
    format: flagHelpers.string({
      char: 'f',
      default: 'stylish',
      description: 'formatter to use for outputting results',
      options: ['json', 'stylish'],
    }),
    output: flagHelpers.string({
      char: 'o',
      description: 'output to a file instead of stdout',
    }),
    maxResults: flagHelpers.integer({
      char: 'm',
      description: '[default: all] maximum results to show',
    }),
    verbose: flagHelpers.boolean({
      char: 'v',
      description: 'increase verbosity',
    }),
    ruleset: flagHelpers.string({
      char: 'r',
      description: 'path to a ruleset file (supports http)',
    }),
  };

  public static args = [{ name: 'source' }];

  public async run() {
    const { args, flags } = this.parse(Lint);
    const { ruleset } = flags;
    let ruleCollection;

    if (ruleset) {
      try {
        this.log(`Reading ruleset`);
        ruleCollection = await readRuleset(ruleset, this);
      } catch (ex) {
        this.error(ex.message);
      }
    }

    if (args.source) {
      try {
        await lint(args.source, flags, this, ruleCollection);
      } catch (ex) {
        this.error(ex.message);
      }
    } else {
      this.error('You must specify a document to lint');
    }
  }
}

async function lint(name: string, flags: any, command: Lint, customRuleset?: RuleCollection) {
  command.log(`Linting ${name}`);
  const spec: IParserResult = await readParsable(name, flags.encoding);

  const spectral = new Spectral();
  if (parseInt(spec.data.swagger) === 2) {
    command.log('OpenAPI 2.0 (Swagger) detected');
    spectral.addFunctions(oas2Functions());
    spectral.addRules(oas2Rules());
  } else if (parseInt(spec.data.openapi) === 3) {
    command.log('OpenAPI 3.x detected');
    spectral.addFunctions(oas3Functions());
    spectral.addRules(oas3Rules());
  } else {
    throw new Error('Input document specification type could not be determined');
  }

  if (customRuleset) {
    spectral.addRules(customRuleset);
  }

  let results = [];
  try {
    const parsedResult: IParsedResult = {
      source: resolve(process.cwd(), name),
      parsed: spec,
      getLocationForJsonPath,
    };

    results = await spectral.run(parsedResult);
    if (results.length === 0) {
      command.log('No errors or warnings found!');
      return;
    }
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }

  const output = await formatOutput(results, flags);
  try {
    await writeOutput(output, flags, command);
    process.exitCode = 1;
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }
}
