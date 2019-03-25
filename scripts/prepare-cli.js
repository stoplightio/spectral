const { copySync, moveSync, readJSONSync, writeJSONSync } = require('fs-extra');
const { resolve } = require('path');

const cwd = process.cwd();

// copy bin directory over
copySync(resolve(cwd, 'bin'), resolve(cwd, 'dist', 'bin'));

// move generated manifest
moveSync(resolve(cwd, 'oclif.manifest.json'), resolve(cwd, 'dist', 'oclif.manifest.json'));

// update the dist package.json file with cli properties
const pkgPath = resolve(cwd, 'dist', 'package.json');
const pkg = readJSONSync(pkgPath);

pkg.bin = {
  spectral: './bin/run',
};

pkg.oclif = {
  commands: './cli/commands',
  bin: 'spectral',
  plugins: ['@oclif/plugin-help'],
};

// write it back
writeJSONSync(pkgPath, pkg);

// tslint-disable-next-line no-console
console.log("updated dist folder with cli related files and changes");
