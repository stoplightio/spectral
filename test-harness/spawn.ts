import { Optional } from '@stoplight/types';
import * as child_process from 'child_process';
import { Transform } from 'stream';
import Shell = require('node-powershell');
import { normalizeLineEndings, IS_WINDOWS } from './helpers';
import { isError } from 'lodash';

export type SpawnReturn = {
  stdout: string;
  stderr: string;
  status: number;
};

export type SpawnFn = (
  command: string,
  env: Optional<typeof process.env>,
  cwd: Optional<string>,
) => Promise<SpawnReturn>;

const createStream = (): Transform =>
  new Transform({
    transform(chunk, encoding, done): void {
      this.push(chunk);
      done();
    },
  });

function stringifyStream(stream: Transform): Promise<string> {
  let result = '';

  stream.on('readable', () => {
    let chunk: string | null;

    // tslint:disable-next-line:no-conditional-assignment
    while ((chunk = stream.read()) !== null) {
      result += chunk;
    }
  });

  return new Promise<string>((resolve, reject) => {
    stream.on('error', reject);
    stream.on('end', () => {
      resolve(result);
    });
  });
}

const r = /(.*)LASTEXITCODE=(.*)/s;

export const spawnPowershell: SpawnFn = async (command, env, cwd): Promise<SpawnReturn> => {
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

export const spawnNode: SpawnFn = async (script, env, cwd) => {
  if (IS_WINDOWS) {
    return spawnPowershell(script, env, cwd);
  }

  const stderr = createStream();
  const stdout = createStream();

  const handle = child_process.spawn(script, [], {
    shell: true,
    windowsVerbatimArguments: false,
    env,
    cwd,
    stdio: 'pipe',
  });

  handle.stderr.pipe(stderr);
  handle.stdout.pipe(stdout);

  const stderrText = (await stringifyStream(stderr)).trim();
  const stdoutText = (await stringifyStream(stdout)).trim();

  const status = await new Promise<number>(resolve => {
    handle.on('close', resolve);
  });

  return {
    stderr: normalizeLineEndings(stderrText),
    stdout: normalizeLineEndings(stdoutText),
    status,
  };
};
