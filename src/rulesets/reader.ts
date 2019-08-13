import { Cache } from '@stoplight/json-ref-resolver';
import { ICache } from '@stoplight/json-ref-resolver/types';
import { join } from '@stoplight/path';
import { parse } from '@stoplight/yaml';
import { readFile, readParsable } from '../fs/reader';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { FunctionsCollection } from '../types';
import { FileRulesetSeverity, IRuleset } from '../types/ruleset';
import { evaluateExport } from './evaluators';
import { findFile } from './finder';
import { mergeFormats, mergeFunctions, mergeRules } from './mergers';
import { assertValidRuleset } from './validation';

export async function readRuleset(...uris: string[]): Promise<IRuleset> {
  const base: IRuleset = {
    rules: {},
    functions: {},
  };

  const cache = new Cache();

  for (const uri of uris) {
    const resolvedRuleset = await processRuleset(cache, uri, uri);
    mergeRules(base.rules, resolvedRuleset.rules);
    Object.assign(base.functions, resolvedRuleset.functions); // todo: bind fn
  }

  return base;
}

async function processRuleset(
  uriCache: ICache,
  baseUri: string,
  uri: string,
  severity?: FileRulesetSeverity,
): Promise<IRuleset> {
  const rulesetUri = await findFile(join(baseUri, '..'), uri);
  const { result } = await httpAndFileResolver.resolve(parse(await readParsable(rulesetUri, 'utf8')), {
    baseUri: rulesetUri,
    dereferenceInline: false,
    uriCache,
    async parseResolveResult(opts) {
      try {
        opts.result = parse(opts.result);
      } catch {
        // happens
      }
      return opts;
    },
  });
  const ruleset = assertValidRuleset(JSON.parse(JSON.stringify(result)));
  const rules = {};
  const functions = {};
  const newRuleset: IRuleset = {
    rules,
    functions,
  };

  const extendedRulesets = ruleset.extends;
  const rulesetFunctions = ruleset.functions;

  if (extendedRulesets !== void 0) {
    for (const extended of Array.isArray(extendedRulesets) ? extendedRulesets : [extendedRulesets]) {
      if (Array.isArray(extended)) {
        const parentSeverity = severity === undefined ? extended[1] : severity;
        mergeRules(rules, (await processRuleset(uriCache, uri, extended[0], parentSeverity)).rules, parentSeverity);
      } else {
        const parentSeverity = severity === undefined ? 'recommended' : severity;
        mergeRules(rules, (await processRuleset(uriCache, uri, extended, parentSeverity)).rules, parentSeverity);
      }
    }
  }

  mergeRules(rules, ruleset.rules);
  if (Array.isArray(ruleset.formats)) {
    mergeFormats(rules, ruleset.formats);
  }

  if (rulesetFunctions !== void 0) {
    const rulesetFunctionsBaseDir = ruleset.functionsDir !== void 0 ? ruleset.functionsDir : join(rulesetUri, '..');
    const resolvedFunctions: FunctionsCollection = {};

    await Promise.all(
      rulesetFunctions.map(async fn => {
        const fnName = Array.isArray(fn) ? fn[0] : fn;
        // todo: consume schema, i.e. wrap a function
        resolvedFunctions[fnName] = evaluateExport(
          await readFile(await findFile(rulesetFunctionsBaseDir, `./functions/${fnName}.js`), 'utf-8'),
        );

        Reflect.defineProperty(resolvedFunctions[fnName], 'name', {
          configurable: true,
          value: fnName,
        });
      }),
    );

    mergeFunctions(functions, resolvedFunctions, rules);
  }

  return newRuleset;
}
