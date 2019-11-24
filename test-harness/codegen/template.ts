import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import * as fs from 'fs';
import { applyReplacements, IScenarioFile, parseScenarioFile } from '../helpers';
import { spawnNode } from '../spawn';

const spectralBin = '';
const scenarioFilepath = '';

const assets = new Map<string, string>();

const replacements: Dictionary<string> = {
  __dirname,
  bin: spectralBin,
};

for (const [id, name] of assets.entries()) {
  generateReplacement(id, name);
}

describe('<scenario>', () => {
  let scenario: IScenarioFile;

  beforeAll(async () => {
    scenario = parseScenarioFile(await fs.promises.readFile(scenarioFilepath, 'utf8'));
  });

  test('<test>', async () => {
    const command = applyReplacements(scenario.command, replacements);
    const { stderr, stdout, status } = await spawnNode(command, scenario.env);

    const expectedStdout = scenario.stdout === void 0 ? void 0 : applyReplacements(scenario.stdout, replacements);
    const expectedStderr = scenario.stderr === void 0 ? void 0 : applyReplacements(scenario.stderr, replacements);

    expect(stderr).toEqual(expectedStderr);

    if (expectedStdout !== void 0) {
      expect(stdout).toEqual(expectedStdout);
    }

    if (scenario.status !== void 0) {
      expect(`status:${status}`).toEqual(`status:${scenario.status}`);
    }
  });
});

function generateReplacement(id: string, val: string) {
  replacements[id] = val;
  replacements[`${id}|no-ext`] = val.replace(new RegExp(`${path.extname(val)}$`), '');
}
