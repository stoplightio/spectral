import { normalize } from '@stoplight/path';
import * as fg from 'fast-glob';

export async function listFiles(pattens: Array<number | string>): Promise<Array<number | string>> {
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

  return [...urls, ...fileDescriptors, ...(await fg(files, { dot: true, absolute: true })).map(normalize)]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
