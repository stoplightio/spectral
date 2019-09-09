// @ts-ignore
import * as fetch from 'node-fetch';
import * as ProxyAgent from 'proxy-agent';

export default (uri: string, opts: any = {}) => {
  const options = process.env.PROXY ? { ...opts, agent: new ProxyAgent(process.env.PROXY) } : opts;

  return fetch(uri, options);
};
