import { RequestInit } from 'node-fetch';
import * as ProxyAgent from 'proxy-agent';

const fetch = require('node-fetch');

export default (uri: string, opts: RequestInit = {}) => {
  const options =
    typeof process === 'object' && process.env.PROXY ? { ...opts, agent: new ProxyAgent(process.env.PROXY) } : opts;

  return fetch(uri, options);
};
