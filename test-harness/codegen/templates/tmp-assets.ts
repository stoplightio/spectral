import * as fs from 'fs';
import { tmpFile } from '../../helpers';

beforeAll(async () => {
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

afterAll(() => {
  for (const { removeCallback } of tmpFileHandles.values()) {
    removeCallback();
  }

  tmpFileHandles.clear();
});
