import { normalize } from '@stoplight/path';
import * as fg from 'fast-glob';

const GLOB_OPTIONS = {
  absolute: true,
  dot: true,
};

async function match(pattern: fg.Pattern | fg.Pattern[]): Promise<string[]> {
  return (await fg(pattern, GLOB_OPTIONS)).map(normalize);
}

export async function listFiles(
  pattens: Array<number | string>,
  ignoreUnmatchedGlobs: boolean,
): Promise<[Array<number | string>, Array<number | string>]> {
  const { files, fileDescriptors, urls } = pattens.reduce<{
    files: string[];
    urls: string[];
    fileDescriptors: number[];
  }>(
    (group, pattern) => {
      if (typeof pattern === 'number') {
        group.fileDescriptors.push(pattern);
      } else if (!/^https?:\/\//.test(pattern)) {
        group.files.push(pattern.replace(/\\/g, '/'));
      } else {
        group.urls.push(pattern);
      }

      return group;
    },
    {
      files: [],
      urls: [],
      fileDescriptors: [],
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

  return [[...urls, ...fileDescriptors, ...filesFound], fileSearchWithoutResult]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
