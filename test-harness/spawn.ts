import { join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import * as child_process from 'child_process';
import { Transform } from 'stream';
import { normalizeLineEndings } from './helpers';

const cwd = join(__dirname, 'scenarios');

export type SpawnReturn = {
  stdout: string;
  stderr: string;
  status: number;
};

export type SpawnFn = (command: string, env: Optional<typeof process.env>) => Promise<SpawnReturn>;

const createStream = () =>
  new Transform({
    transform(chunk, encoding, done) {
      this.push(chunk);
      done();
    },
  });

function stringifyStream(stream: Transform) {
  let result = '';

  stream.on('readable', () => {
    let chunk: string | null;

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

export const spawnNode: SpawnFn = async (script, env) => {
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
