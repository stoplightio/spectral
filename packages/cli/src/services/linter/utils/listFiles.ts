import { normalize } from '@stoplight/path';
import fg from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';

const GLOB_OPTIONS = {
  absolute: true,
  dot: true,
};

function isFile(pattern: string): boolean {
  try {
    return fs.statSync(pattern).isFile();
  } catch {
    return false;
  }
}

// A pattern that is the path of an existing file is used as is, so that characters
// such as ( ) [ ] { } in a file name are not read as glob syntax.
async function match(patterns: fg.Pattern[]): Promise<string[]> {
  const literalFiles: string[] = [];
  const globs: fg.Pattern[] = [];
  for (const pattern of patterns) {
    if (isFile(pattern)) {
      literalFiles.push(normalize(path.resolve(pattern)));
    } else {
      globs.push(pattern);
    }
  }

  if (globs.length === 0) {
    return literalFiles;
  }

  const globbed = (await fg(globs.length === 1 ? globs[0] : globs, GLOB_OPTIONS)).map(normalize);
  return [...new Set([...literalFiles, ...globbed])];
}

const compareString = (a: string, b: string): number => a.localeCompare(b);

export async function listFiles(patterns: string[], ignoreUnmatchedGlobs: boolean): Promise<[string[], string[]]> {
  const { files, urls } = patterns.reduce<{
    files: string[];
    urls: string[];
  }>(
    (group, pattern) => {
      if (!/^https?:\/\//.test(pattern)) {
        group.files.push(pattern.replace(/\\/g, '/'));
      } else {
        group.urls.push(pattern);
      }

      return group;
    },
    {
      files: [],
      urls: [],
    },
  );

  const filesFound: string[] = [];
  const fileSearchWithoutResult: string[] = [];

  // to avoid a perf hit, let's have 2 paths
  if (ignoreUnmatchedGlobs) {
    filesFound.push(...(await match(files)));
  } else {
    await Promise.all(
      files.map(async pattern => {
        const resultFg = await match([pattern]);
        if (resultFg.length === 0) {
          fileSearchWithoutResult.push(pattern);
        }

        filesFound.push(...resultFg);
      }),
    );
  }

  return [[...urls, ...filesFound].sort(compareString), fileSearchWithoutResult]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
