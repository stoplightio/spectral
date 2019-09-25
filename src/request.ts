import fetch, { RequestInit } from 'node-fetch';

export const DEFAULT_REQUEST_OPTIONS: RequestInit = {};

export default async (uri: string, opts: RequestInit = {}) => {
  return fetch(uri, { ...opts, ...DEFAULT_REQUEST_OPTIONS });
};
