import type { SpawnFn } from '@stoplight/spectral-test-harness';
import * as child_process from 'child_process';
import { Transform } from 'stream';
import { normalizeLineEndings } from '../utils';

export { normalizeLineEndings, applyReplacements } from '../utils';

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

export const spawnNode: SpawnFn = async (script, env, cwd) => {
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
