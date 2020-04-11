'use strict';
const path = require('path');
const fs = require('fs');
const { Parser } = require('jison');

const grammar = require('../src/runner/parser/grammar');

const parser = new Parser(grammar);

fs.writeFileSync(path.join(__dirname, '../src/runner/parser/parser.js'), parser.generate());
