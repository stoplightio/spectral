import { normalize } from '@stoplight/path';
import * as fg from 'fast-glob';

export async function listFiles(pattens: Array<number | string>): Promise<Array<number | string>> {
  const { files, fds, urls } = pattens.reduce<{ files: string[]; urls: string[]; fds: number[] }>(
    (group, pattern) => {
      if (typeof pattern === 'number') {
        group.fds.push(pattern);
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
      fds: [],
    },
  );

  return [...urls, ...fds, ...(await fg(files, { dot: true, absolute: true })).map(normalize)]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
