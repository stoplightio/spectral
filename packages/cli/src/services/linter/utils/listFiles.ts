import { normalize } from '@stoplight/path';
import * as fg from 'fast-glob';

const GLOB_OPTIONS = {
  absolute: true,
  dot: true,
};

async function match(pattern: fg.Pattern | fg.Pattern[]): Promise<string[]> {
  return (await fg(pattern, GLOB_OPTIONS)).map(normalize);
}

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
        const resultFg = await match(pattern);
        if (resultFg.length === 0) {
          fileSearchWithoutResult.push(pattern);
        }

        filesFound.push(...resultFg);
      }),
    );
  }

  return [[...urls, ...filesFound], fileSearchWithoutResult]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
