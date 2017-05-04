const rollup = require('rollup');
const sourcemaps = require('rollup-plugin-sourcemaps');
const nodeResolve = require('rollup-plugin-node-resolve');
const path = require('path');
const fs = require('fs');

let config = {
    entry: './__artifacts/build/index.js',
    plugins: [
        nodeResolve(),
        {
            // Assumes any remaining scoped package is a local neighbor.
            resolveId: function(importee, importer) {
                if (!importee.startsWith('@'))
                    return;
                return path.resolve('..', importee.substr(importee.indexOf('/') + 1), '__artifacts/build/index.js');
            }
        },
        sourcemaps()
    ],
    external: function (id) {
        return !id.startsWith('.') && !id.startsWith('/') && !fs.existsSync(id);
    }
};

rollup.rollup(config).then(b => Promise.all([
    b.write({
        dest: `./__artifacts/release/bundles/platform-angular.umd.js`,
        format: 'umd',
        sourceMap: true,
        moduleName: 'sharpangles.platformAngular',
        globals: function (id) {
            if (id.startsWith('@'))
                return id.replace('@angular/', 'ng.').replace('@', '').replace('/', '.').replace(/-./, (match) => match.substr(1).toUpperCase());
            if (id.startsWith('rxjs/add/'))
                return 'Rx.Observable.prototype';
            if (id.startsWith('rxjs/'))
                return 'Rx';
            if (id == 'tslib')
                return 'tslib';
        }
    }),
    b.write({
        dest: `./__artifacts/release/bundles/platform-angular.es.js`,
        format: 'es',
        sourceMap: true
    })]));
