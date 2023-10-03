import * as fs from 'node:fs';
import process from 'node:process';
import { join } from 'node:path';

const cwd = process.cwd();
const filepath = join(cwd, 'src/version.ts');

const { name, version } = getVersionFromArgv() || JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf8'));

try {
  const existingVersion = /VERSION = '([^']+)';/.exec(fs.readFileSync(filepath, 'utf8'));
  if (existingVersion !== null && !isNewerVersion(existingVersion[1], version)) {
    log(`Skipping inlining. Next version is not newer than the existing one: ${existingVersion[1]}.`);
    process.exit(0);
  }
} catch (ex) {
  // no-op
}

fs.writeFileSync(filepath, `export const VERSION = '${version}';\n`);

log(`Inlined ${version} version in ${name}.`);

function isNewerVersion(current, next) {
  const [curMajor, curMinor, curPatch] = current.split('.').map(Number);
  const [nextMajor, nextMinor, nextPatch] = next.split('.').map(Number);

  return (
    nextMajor > curMajor ||
    (curMajor === nextMajor && (nextMinor > curMinor || (curMinor <= nextMinor && nextPatch > curPatch)))
  );
}

function log(message) {
  if (process.argv.includes('--verbose') || process.env.CI) {
    process.stdout.write(`${message}\n`);
  }
}

function getVersionFromArgv() {
  if (process.argv.length < 3) return null;

  const r = /^([0-9]+\.){2}[0-9]+$/;

  for (let i = 2; i < process.argv.length; i++) {
    const value = process.argv[i];
    if (r.exec(value)) {
      return value;
    }
  }

  return null;
}
