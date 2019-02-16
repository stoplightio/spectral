import { Command, flags as flagHelpers } from '@oclif/command';
import { parseWithPointers } from '@stoplight/yaml';
import { existsSync, readFile } from 'fs';
import { inspect, promisify } from 'util';

// @ts-ignore
import * as fetch from 'node-fetch';

import { oas2Functions, oas2Rules } from '../../rulesets/oas2';
import { oas3Functions, oas3Rules } from '../../rulesets/oas3';
import { Spectral } from '../../spectral';

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
    maxWarn: flagHelpers.integer({
      char: 'm',
      description: '[default: all] maximum warnings to show',
    }),
    verbose: flagHelpers.boolean({
      char: 'v',
      description: 'increase verbosity',
    }),
  };

  public static args = [{ name: 'source' }];

  public async run() {
    const { args, flags } = this.parse(Lint);

    if (args.source) {
      try {
        await lint(args.source, flags, this);
      } catch (ex) {
        this.error(ex.message);
      }
    } else {
      this.error('You must specify a document to lint');
    }
  }
}

async function lint(name: string, flags: any, command: Lint) {
  command.log(`linting ${name}`);

  let text: string;
  let obj: any;

  if (name.startsWith('http')) {
    const res = await fetch(name);
    text = await res.text();
  } else if (existsSync(name)) {
    const readFileAsync = promisify<(path: string, encoding: string) => Promise<string>>(readFile);

    try {
      text = await readFileAsync(name, flags.encoding);
    } catch (ex) {
      throw new Error(`Could not read ${name}: ${ex.message}`);
    }
  } else {
    throw new Error(`${name} does not exist`);
  }

  try {
    obj = parseWithPointers(text);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }

  const spectral = new Spectral();
  if (obj.data.swagger && obj.data.swagger === '2.0') {
    command.log('Swagger/OpenAPI 2.0 detected');
    spectral.addFunctions(oas2Functions());
    spectral.addRules(oas2Rules());
  } else if (obj.data.openapi && typeof obj.data.openapi === 'string' && obj.data.openapi.startsWith('3.')) {
    command.log('OpenAPI 3.x detected');
    spectral.addFunctions(oas3Functions());
    spectral.addRules(oas3Rules());
  } else {
    throw new Error('Input document specification type could not be determined');
  }

  try {
    const output = spectral.run(obj.data);

    if (output.results.length === 0) {
      command.log('No errors or warnings found!');
    } else {
      process.exitCode = 1;
      const warnings = flags.maxWarn ? output.results.slice(0, flags.maxWarn) : output.results;
      for (const issue of warnings) {
        command.warn(inspect(issue, { depth: null, colors: true }));
      }
    }
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }
}
