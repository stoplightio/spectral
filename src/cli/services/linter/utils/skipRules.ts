import { RuleCollection } from '../../../../types';
import { ILintConfig } from '../../../../types/config';

export const skipRules = (rules: RuleCollection, flags: ILintConfig): RuleCollection => {
  const skippedRules: string[] = [];
  const invalidRules: string[] = [];

  if (flags.skipRule !== undefined) {
    for (const rule of Array.isArray(flags.skipRule) ? flags.skipRule : [flags.skipRule]) {
      if (rule in rules) {
        delete rules[rule];
        skippedRules.push(rule);
      } else {
        invalidRules.push(rule);
      }
    }
  }

  if (invalidRules.length !== 0 && !flags.quiet) {
    console.warn(`ignoring invalid ${invalidRules.length > 1 ? 'rules' : 'rule'} "${invalidRules.join(', ')}"`);
  }

  if (skippedRules.length !== 0 && flags.verbose) {
    console.info(`skipping ${skippedRules.length > 1 ? 'rules' : 'rule'} "${skippedRules.join(', ')}"`);
  }

  return rules;
};
