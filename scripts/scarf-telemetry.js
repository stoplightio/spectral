const https = require('https');

function reportToScarf() {
  if (process.env.DO_NOT_TRACK || process.env.SCARF_NO_ANALYTICS === 'true') {
    return;
  }

  const version = require('./package.json').version;
  const platform = `${process.platform}-${process.arch}`;
  const url = `https://smartbear.gateway.scarf.sh/docker-runtime/${version}/${platform}`;

  const req = https.get(url, { timeout: 2000 }, (res) => {
    res.resume(); // consume response, don't block
  });
  req.on('error', () => {});
  req.on('timeout', () => req.destroy());
}

reportToScarf();
