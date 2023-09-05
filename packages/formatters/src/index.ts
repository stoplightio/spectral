export * from './json';
export * from './stylish';
export * from './junit';
export * from './html';
export * from './text';
export * from './teamcity';
import type { Formatter } from './types';
export type { Formatter, FormatterOptions } from './types';

export const pretty: Formatter = () => {
  throw Error('pretty formatter is available only in Node.js');
};

export const githubActions: Formatter = () => {
  throw Error('github-actions formatter is available only in Node.js');
};

export const sarif: Formatter = () => {
  throw Error('sarif formatter is available only in Node.js');
};
