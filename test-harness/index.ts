import { spawnSync } from 'child_process';
import * as fs from 'fs';
// @ts-ignore
import * as globFs from 'glob-fs';
import * as os from 'os';
import * as path from 'path';
// @ts-ignore
import * as tmp from 'tmp';
import { parseScenarioFile } from './helpers';

const glob = globFs({ gitignore: true });

const spectralBin = path.join(__dirname, '../binaries/spectral-linux');

type Replacement = {
  from: RegExp;
  to: string;
};

function replaceVars(string: string, replacements: Replacement[]) {
  return replacements.reduce((str, replace) => str.replace(replace.from, replace.to), string);
}

describe('cli e2e tests', () => {
  const files = process.env.TESTS
    ? String(process.env.TESTS).split(',')
    : glob.readdirSync('**/*.scenario', { cwd: path.join(__dirname, './scenarios') });

  files.forEach((file: string) => {
    const data = fs.readFileSync(path.join(__dirname, './scenarios/', file), { encoding: 'utf8' });
    const scenario = parseScenarioFile(data);
    const replacements: Replacement[] = [];

    let tmpFileHandle: tmp.FileSyncObject;

    beforeAll(() => {
      if (scenario.document) {
        tmpFileHandle = tmp.fileSync({
          postfix: '.yml',
          dir: undefined,
          name: undefined,
          prefix: undefined,
          tries: 10,
          template: undefined,
          unsafeCleanup: undefined,
        });

        replacements.push({
          from: /\{document\}/g,
          to: tmpFileHandle.name,
        });

        fs.writeFileSync(tmpFileHandle.name, scenario.document, { encoding: 'utf8' });
      }
    });

    afterAll(() => {
      if (scenario.document) {
        tmpFileHandle.removeCallback(undefined, undefined, undefined, undefined);
      }
    });

    test(`${file}${os.EOL}${scenario.test}`, () => {
      // TODO split on " " is going to break quoted args
      const args = scenario.command.split(' ').map(t => {
        const arg = t.trim();
        if (scenario.document && arg === '{document}') {
          return tmpFileHandle.name;
        }
        return arg;
      });

      const commandHandle = spawnSync(spectralBin, args, {
        shell: true,
        encoding: 'utf8',
        windowsVerbatimArguments: false,
      });

      const stderr = commandHandle.stderr.trim();
      const stdout = commandHandle.stdout.trim();
      const expectedStderr = replaceVars(scenario.stderr.trim(), replacements);
      const expectedStdout = replaceVars(scenario.stdout.trim(), replacements);

      if (expectedStderr) {
        expect(stderr).toEqual(expectedStderr);
      } else if (stderr) {
        throw new Error(stderr);
      }

      if (stdout) {
        expect(stdout).toEqual(expectedStdout);
      }
    });
  });
});
