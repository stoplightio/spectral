import Shell from 'node-powershell';
import { isError } from 'lodash';
import type { SpawnFn } from '@stoplight/spectral-test-harness';

import { normalizeLineEndings } from '../utils';

export { normalizeLineEndings, applyReplacements } from '../utils';

const r = /(.*)LASTEXITCODE=(.*)/s;

export const spawnNode: SpawnFn = async (command, env, cwd) => {
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
    inputEncoding: 'utf8',
    outputEncoding: 'utf8',
  });

  const winCommand = command.replace(/\/binaries\/(spectral\.exe|spectral)/, '/binaries/spectral.exe');
  const wrappedCommand = `cd '${cwd}';${winCommand};echo LASTEXITCODE=$LASTEXITCODE`;
  const finalCommand = `powershell -Command "& { ${wrappedCommand} }"`;

  await ps.addCommand(finalCommand);

  try {
    const stdOut = await ps.invoke();
    const splitted = r.exec(stdOut);

    if (splitted === null) {
      throw new Error('No LASTEXITCODE has been found in the output.');
    }

    return {
      stderr: '',
      stdout: normalizeLineEndings(splitted[1].trim()),
      status: Number.parseInt(splitted[2]),
    };
  } catch (err) {
    return {
      stderr: normalizeLineEndings(isError(err) ? err.message.replace(r, '$1').trim() : String(err)),
      stdout: '',
      status: 1,
    };
  } finally {
    await ps.dispose();
  }
};
