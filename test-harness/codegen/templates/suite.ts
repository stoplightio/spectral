import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import * as fs from 'fs';
import {
  applyReplacements,
  IScenarioFile,
  parseScenarioFile,
  /* @given scenario.tmpAssets */ tmpFile,
} from './helpers';
import { spawnNode } from './spawn';

// @given scenario.tmpAssets
import * as tmp from 'tmp';

const spectralBin = /* @inject SPECTRAL_BIN */ '';
const scenarioFilepath = /* @inject SCENARIO_FILE_PATH */ '';

const assets = new Map<string, string>();

const replacements: Dictionary<string> = {
  __dirname,
  bin: spectralBin,
};

for (const [id, name] of assets.entries()) {
  generateReplacement(id, name);
}

describe(/* @inject SCENARIO_NAME */ '<scenario>', () => {
  let scenario: IScenarioFile;

  // @given scenario.tmpAssets
  const tmpFileHandles = new Map<string, tmp.FileResult>();

  beforeAll(async () => {
    scenario = parseScenarioFile(await fs.promises.readFile(scenarioFilepath, 'utf8'));

    // @given scenario.tmpAssets
    if (scenario.tmpAssets.length > 0) {
      await Promise.all(
        scenario.tmpAssets.map(async ([asset, contents]) => {
          const tmpFileHandle = await tmpFile();
          tmpFileHandles.set(asset, tmpFileHandle);

          generateReplacement(asset, tmpFileHandle.name);

          await fs.promises.writeFile(tmpFileHandle.name, contents, 'utf8');
        }),
      );
    }
  });

  // @given scenario.tmpAssets
  afterAll(() => {
    for (const { removeCallback } of tmpFileHandles.values()) {
      removeCallback();
    }

    tmpFileHandles.clear();
  });

  test(/* @inject TEST_NAME */ '<test>', async () => {
    const command = applyReplacements(scenario.command, replacements);
    const spawnReturn = await spawnNode(command, scenario.env);

    // @given scenario.stderr
    expect(spawnReturn.stderr).toEqual(applyReplacements(scenario.stderr!, replacements));

    // @given scenario.stdout
    expect(spawnReturn.stdout).toEqual(applyReplacements(scenario.stdout!, replacements));

    // @given scenario.status
    expect(`status:${spawnReturn.status}`).toEqual(`status:${scenario.status}`);
  });
});

function generateReplacement(id: string, val: string) {
  replacements[id] = val;
  replacements[`${id}|no-ext`] = val.replace(new RegExp(`${path.extname(val)}$`), '');
}
