import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import * as fs from 'fs';
import {
  applyReplacements,
  IScenarioFile,
  parseScenarioFile,
  /* given: scenario.tmpAssets.length > 0 */ tmpFile,
} from '../../helpers';
import { spawnNode } from '../../spawn';

// given: scenario.tmpAssets.length > 0
import * as tmp from 'tmp';

const assets = new Map<string, string>();

const replacements: Dictionary<string> = {
  __dirname: /* inject: SCENARIOS_ROOT */ '',
  bin: /* inject: SPECTRAL_BIN */ '',
  get date() {
    return String(new Date());
  },
};

for (const [id, name] of assets.entries()) {
  generateReplacement(id, name);
}

describe(/* inject: SCENARIO_NAME */ '<scenario>', () => {
  let scenario: IScenarioFile;

  // given: scenario.tmpAssets.length > 0
  const tmpFileHandles = new Map<string, tmp.FileResult>();

  beforeAll(async () => {
    scenario = parseScenarioFile(await fs.promises.readFile(/* inject: SCENARIO_FILE_PATH */ '', 'utf8'));

    // given: scenario.tmpAssets.length > 0
    await Promise.all(
      scenario.tmpAssets.map(async ([asset, contents]) => {
        const tmpFileHandle = await tmpFile();
        tmpFileHandles.set(asset, tmpFileHandle);

        generateReplacement(asset, tmpFileHandle.name);

        await fs.promises.writeFile(tmpFileHandle.name, contents, 'utf8');
      }),
    );
  });

  // given: scenario.tmpAssets.length > 0
  afterAll(() => {
    for (const { removeCallback } of tmpFileHandles.values()) {
      removeCallback();
    }

    tmpFileHandles.clear();
  });

  test(/* inject: TEST_NAME */ '<test>', async () => {
    const command = applyReplacements(scenario.command, replacements);
    const spawnReturn = await spawnNode(command, scenario.env);

    // given: scenario.stderr !== void 0
    expect(spawnReturn.stderr).toEqual(applyReplacements(scenario.stderr!, replacements));

    // given: scenario.stdout !== void 0
    expect(spawnReturn.stdout).toEqual(applyReplacements(scenario.stdout!, replacements));

    // given: scenario.status !== void 0
    expect(`status:${spawnReturn.status}`).toEqual(`status:${scenario.status}`);
  });
});

function generateReplacement(id: string, val: string) {
  replacements[id] = val;
  replacements[`${id}|no-ext`] = val.replace(new RegExp(`${path.extname(val)}$`), '');
}
