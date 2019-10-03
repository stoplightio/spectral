import { normalize } from '@stoplight/path';
import * as fg from 'fast-glob';

export async function listFiles(pattens: string[]): Promise<string[]> {
  const { files, urls } = pattens.reduce<{ files: string[]; urls: string[] }>(
    (group, pattern) => {
      if (!/^https?:\/\//.test(pattern)) {
        group.files.push(pattern);
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

  return [...urls, ...(await fg(files, { dot: true, absolute: true })).map(normalize)]; // let's normalize OS paths produced by fast-glob to have consistent paths across all platforms
}
