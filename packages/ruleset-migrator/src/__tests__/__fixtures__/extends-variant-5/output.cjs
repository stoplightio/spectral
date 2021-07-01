const { migrateRuleset: migrateRuleset } = require('@stoplight/spectral-ruleset-migrator');
module.exports = {
  extends: await migrateRuleset('https://stoplight.io/ruleset.json'),
};
