import { fs } from 'memfs';

export const promises = fs.promises;
export const readFile = fs.readFile;
export const readFileSync = fs.readFileSync;
export const writeFileSync = fs.writeFileSync;
export const mkdirSync = fs.mkdirSync;
export const rmdirSync = fs.rmdirSync;
export const access = fs.access;
