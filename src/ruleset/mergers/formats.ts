import { RuleCollection } from '../../types';

export function mergeFormats(rules: RuleCollection, formats: string[]): void {
  if (formats.length > 0) {
    for (const rule of Object.values(rules)) {
      if (typeof rule === 'object' && rule.formats === void 0) {
        rule.formats = formats;
      }
    }
  }
}
