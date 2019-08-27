import { Cache } from '@stoplight/json-ref-resolver';
import { ICache } from '@stoplight/json-ref-resolver/types';
import { join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import { JSONSchema7 } from 'json-schema';
import { readFile, readParsable } from '../fs/reader';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { FileRulesetSeverity, IRuleset, RulesetFunctionCollection } from '../types/ruleset';
import { findFile } from './finder';
import { mergeFormats, mergeFunctions, mergeRules } from './mergers';
import { assertValidRuleset } from './validation';

export interface IRulesetReadOptions {
  timeout?: number;
}

export async function readRuleset(uris: string | string[], opts?: IRulesetReadOptions): Promise<IRuleset> {
  const base: IRuleset = {
    rules: {},
    functions: {},
  };

  const processedRulesets = new Set<string>();
  const processRuleset = createRulesetProcessor(processedRulesets, new Cache(), opts);

  for (const uri of Array.isArray(uris) ? new Set([...uris]) : [uris]) {
    processedRulesets.clear(); // makes sure each separate ruleset starts with clear list
    const resolvedRuleset = await processRuleset(uri, uri);
    if (resolvedRuleset === null) continue;
    Object.assign(base.rules, resolvedRuleset.rules);
    Object.assign(base.functions, resolvedRuleset.functions);
  }

  return base;
}

const createRulesetProcessor = (
  processedRulesets: Set<string>,
  uriCache: ICache,
  readOpts: Optional<IRulesetReadOptions>,
) => {
  return async function processRuleset(
    baseUri: string,
    uri: string,
    severity?: FileRulesetSeverity,
  ): Promise<IRuleset | null> {
    const rulesetUri = await findFile(join(baseUri, '..'), uri);
    if (processedRulesets.has(rulesetUri)) {
      return null;
    }

    processedRulesets.add(rulesetUri);
    const { result } = await httpAndFileResolver.resolve(
      parse(
        await readParsable(rulesetUri, {
          timeout: readOpts && readOpts.timeout,
          encoding: 'utf-8',
        }),
      ),
      {
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
      },
    );
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
        let extendedRuleset: IRuleset | null;
        let parentSeverity: FileRulesetSeverity;
        if (Array.isArray(extended)) {
          parentSeverity = severity === undefined ? extended[1] : severity;
          extendedRuleset = await processRuleset(rulesetUri, extended[0], parentSeverity);
        } else {
          parentSeverity = severity === undefined ? 'recommended' : severity;
          extendedRuleset = await processRuleset(rulesetUri, extended, parentSeverity);
        }

        if (extendedRuleset !== null) {
          mergeRules(rules, extendedRuleset.rules, parentSeverity);
          Object.assign(functions, extendedRuleset.functions);
        }
      }
    }

    mergeRules(rules, ruleset.rules, severity === undefined ? 'recommended' : severity);
    if (Array.isArray(ruleset.formats)) {
      mergeFormats(rules, ruleset.formats);
    }

    if (rulesetFunctions !== void 0) {
      const rulesetFunctionsBaseDir = join(
        rulesetUri,
        ruleset.functionsDir !== void 0 ? join('..', ruleset.functionsDir) : '../functions',
      );
      const resolvedFunctions: RulesetFunctionCollection = {};

      await Promise.all(
        rulesetFunctions.map(async fn => {
          const fnName = Array.isArray(fn) ? fn[0] : fn;
          const fnSchema = Array.isArray(fn) ? (fn[1] as JSONSchema7) : null;

          try {
            resolvedFunctions[fnName] = {
              name: fnName,
              code: await readFile(await findFile(rulesetFunctionsBaseDir, `./${fnName}.js`), {
                timeout: readOpts && readOpts.timeout,
                encoding: 'utf-8',
              }),
              schema: fnSchema,
            };
          } catch (ex) {
            console.warn(`Function '${fnName}' could not be loaded: ${ex.message}`);
          }
        }),
      );

      mergeFunctions(functions, resolvedFunctions, rules);
    }

    return newRuleset;
  };
};
