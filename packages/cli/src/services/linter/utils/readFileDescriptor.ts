import * as fs from 'fs';

import type { IFileReadOptions } from '@stoplight/spectral-runtime';

export async function readFileDescriptor(fd: number, opts: IFileReadOptions): Promise<string> {
  let result = '';

  const stream = fs.createReadStream('', { fd });
  stream.setEncoding(opts.encoding);

  stream.on('readable', () => {
    let chunk: unknown;

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
