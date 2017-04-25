const fs = require('fs');
const Concat = require('concat-with-sourcemaps');

var tslibSource = fs.readFileSync('../../node_modules/tslib/tslib.js').toString();
var tslibUmdSource = fs.readFileSync('./__artifacts/release/bundles/tslib.umd.js').toString();
var platformGlobalSource = fs.readFileSync('./__artifacts/release/bundles/platform-global.umd.js').toString();
var platformGlobalSourcemap = fs.readFileSync('./__artifacts/release/bundles/platform-global.umd.js.map').toString();

let concat = new Concat(true, './__artifacts/release/bundles/platform-global.globaltslib.umd.js', '\n');
concat.add('./node_modules/tslib/tslib.js', tslibSource);
concat.add('./__artifacts/release/bundles/platform-global.umd.js', platformGlobalSource, platformGlobalSourcemap);
fs.writeFileSync('./__artifacts/release/bundles/platform-global.globaltslib.umd.js', concat.content);
fs.writeFileSync('./__artifacts/release/bundles/platform-global.globaltslib.umd.js.map', concat.sourceMap);

concat = new Concat(true, './__artifacts/release/bundles/platform-global.moduletslib.umd.js', '\n');
concat.add('./node_modules/tslib/tslib.js', tslibUmdSource);
concat.add('./__artifacts/release/bundles/platform-global.umd.js', platformGlobalSource, platformGlobalSourcemap);
fs.writeFileSync('./__artifacts/release/bundles/platform-global.moduletslib.umd.js', concat.content);
fs.writeFileSync('./__artifacts/release/bundles/platform-global.moduletslib.umd.js.map', concat.sourceMap);

concat = new Concat(true, './__artifacts/release/bundles/platform-global.all.umd.js', '\n');
concat.add('./node_modules/tslib/tslib.js', tslibSource);
concat.add(null, `if (typeof exports !== 'object' && typeof define !== 'function') { this.tslib = this; }`);
concat.add('./__artifacts/release/bundles/platform-global.umd.js', platformGlobalSource, platformGlobalSourcemap);
fs.writeFileSync('./__artifacts/release/bundles/platform-global.all.umd.js', concat.content);
fs.writeFileSync('./__artifacts/release/bundles/platform-global.all.umd.js.map', concat.sourceMap);
