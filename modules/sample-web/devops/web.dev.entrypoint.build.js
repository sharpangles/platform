const fs = require('fs');
const Concat = require('concat-with-sourcemaps');

var tslibSource = fs.readFileSync('../../node_modules/tslib/tslib.js').toString();
var entrypointSource = fs.readFileSync('./__artifacts/serve/web.dev.entrypoint.umd.js').toString();
var entrypointSourcemap = fs.readFileSync('./__artifacts/serve/web.dev.entrypoint.umd.js.map').toString();

concat = new Concat(true, './__artifacts/release/bundles/web.dev.entrypoint.tslib.umd.js', '\n');
concat.add('./node_modules/tslib/tslib.js', tslibSource);
concat.add(null, `if (typeof exports !== 'object' && typeof define !== 'function') { this.tslib = this; }`);
concat.add('./node_modules/platform-global/__artifacts/release/bundles/tslib.umd.js', entrypointSource, entrypointSourcemap);
fs.writeFileSync('./__artifacts/serve/web.dev.entrypoint.tslib.umd.js', concat.content);
fs.writeFileSync('./__artifacts/serve/web.dev.entrypoint.tslib.umd.js.map', concat.sourceMap);
