import {
  FileRuleDefinition,
  FileRulesetSeverityDefinition,
  RulesetAliasesDefinition,
  RulesetDefinition,
  RulesetExtendsDefinition,
  RulesetOverrideDefinition,
} from '../types';

type MergeableRuleset = Omit<RulesetDefinition, 'overrides'> | RulesetOverrideDefinition;

function getExtension(
  extension: RulesetDefinition | [RulesetDefinition, FileRulesetSeverityDefinition],
): Readonly<RulesetDefinition> {
  return Array.isArray(extension) ? extension[0] : extension;
}

function getExtensions(extensions: RulesetExtendsDefinition): ReadonlyArray<RulesetDefinition> {
  return (Array.isArray(extensions) ? extensions : [extensions]).map(getExtension);
}

export function mergeRulesets(left: MergeableRuleset, right: MergeableRuleset, isOverride: boolean): RulesetDefinition {
  const ruleset: MergeableRuleset = {
    ...left,
    ...right,
  };

  if ('extends' in ruleset && 'extends' in ruleset) {
    const rightExtensions = getExtensions(ruleset.extends);
    (ruleset as Omit<RulesetDefinition, 'extends'> & { extends: RulesetExtendsDefinition }).extends = [
      ...(Array.isArray(ruleset.extends) ? ruleset.extends : [ruleset.extends]).filter(
        ext => !rightExtensions.includes(getExtension(ext)),
      ),
      ...(Array.isArray(ruleset.extends) ? ruleset.extends : [ruleset.extends]),
    ];
  }

  if ('aliases' in left && 'aliases' in right) {
    (ruleset as Omit<RulesetDefinition, 'aliases'> & { aliases: RulesetAliasesDefinition }).aliases = {
      ...left.aliases,
      ...right.aliases,
    };
  }

  if (!('rules' in left) || !('rules' in right)) return ruleset as RulesetDefinition;

  if (isOverride) {
    (ruleset as Omit<RulesetDefinition, 'rules'> & { rules: Record<string, FileRuleDefinition> }).rules = {
      ...left.rules,
      ...right.rules,
    };
  } else {
    const r = ruleset as Omit<RulesetDefinition, 'extends'> & { extends?: RulesetExtendsDefinition };

    if (!('extends' in r)) {
      r.extends = left as RulesetDefinition;
    } else if (Array.isArray(r.extends)) {
      r.extends = [...r.extends, left as RulesetDefinition];
    } else {
      r.extends = [r.extends as RulesetDefinition, left as RulesetDefinition];
    }
  }

  return ruleset as RulesetDefinition;
}
