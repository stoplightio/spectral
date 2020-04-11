const { Spectral, isOpenApiv2, isOpenApiv3 } = require('./dist/index');

const spectral = new Spectral();
spectral.registerFormat('oas2', isOpenApiv2);
spectral.registerFormat('oas3', isOpenApiv3);
spectral.loadRuleset('./.spectral.json')
  .then(() => spectral.run(require('fs').readFileSync('./stripe.json', 'utf8')));
