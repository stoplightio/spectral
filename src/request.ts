import fetch, { RequestInit } from 'node-fetch';

export default async (uri: string, opts: RequestInit = {}) => {
  let options = opts;

  if (typeof process === 'object' && process.env.PROXY) {
    try {
      const ProxyAgent = await import('proxy-agent');
      options = Object.assign(opts, { agent: new ProxyAgent(process.env.PROXY) });
    } catch (ex) {
      console.error(ex.message);
    }
  }

  return fetch(uri, options);
};
