import { normalize } from '@stoplight/path';
import * as fg from 'fast-glob';

async function asyncForEach(array: any, callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export async function listFiles(pattens: Array<number | string>): Promise<Array<Array<number | string>>> {
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

  await asyncForEach(files, async (fileSearch: string) => {
    let resultFg;

    resultFg = [...(await fg(fileSearch, { dot: true, absolute: true })).map(normalize)];
    if (resultFg.length === 0) {
      fileSearchWithoutResult.push(fileSearch);
    }
    filesFound.push(...resultFg);
  });

  return [[...urls, ...fileDescriptors, ...filesFound], fileSearchWithoutResult]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
