import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
export default {
  extends: await migrateRuleset('https://stoplight.io/ruleset.json'),
};
