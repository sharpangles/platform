/// <reference path="../../EntryPoint.ts" />

// require('core-js/es7/reflect');
// import * as path from 'path';
// const rootTsConfig = require('./tsconfig.json');
// const projectTsConfig = require(path.resolve(process.cwd(), './tsconfig.json'));
// const tsConfigPaths = require('tsconfig-paths');

// let paths = {};
// for (let attrname in rootTsConfig.compilerOptions.paths) { paths[attrname] = rootTsConfig.compilerOptions.paths[attrname]; }
// for (let attrname in projectTsConfig.compilerOptions.paths) { paths[attrname] = projectTsConfig.compilerOptions.paths[attrname]; }
// const baseUrl = '../../'; // Either absolute or relative path. If relative it's resolved to current working directory.
// tsConfigPaths.register({
//     baseUrl,
//     paths: paths
// });


namespace __sharpangles {
    export class NodeAngular {
        async runAsync() {
            try {
                __sharpangles.hackXHRForDynamicAngular();
                if (Bootstrapper && await scriptTagLoader.loadAsync('node_modules/zone.js/dist/async-test.js', '/base')) {
                    await scriptTagLoader.loadAsync('node_modules/zone.js/dist/long-stack-trace-zone.js', '/base');
                    await scriptTagLoader.loadAsync('node_modules/zone.js/dist/fake-async-test.js', '/base');
                    await scriptTagLoader.loadAsync('node_modules/zone.js/dist/sync-test.js', '/base');
                    await scriptTagLoader.loadAsync('node_modules/zone.js/dist/proxy.js', '/base');
                    await scriptTagLoader.loadAsync('node_modules/zone.js/dist/jasmine-patch.js', '/base');
                    var testBed = (await System.import('@angular/core/testing')).TestBed;
                    var testing = await System.import('@angular/platform-browser-dynamic/testing');
                    testBed.initTestEnvironment(testing.BrowserDynamicTestingModule, testing.platformBrowserDynamicTesting());
                }
                await this.ensureKarmaTestsLoadedAsync();
            }
            catch (ex) {
                console.error(ex.stack || ex);
            }
            __karma__.start();
        }

        ensureKarmaTestsLoadedAsync() {
            return Promise.all(this.getKarmaTestFiles().map(fileName => this.loadTestsAsync(fileName)));
        }

        getKarmaTestFiles(): string[] {
            return Object.keys((<any>window).__karma__.files).filter(path => !path.startsWith("/base/node_modules/") && /.spec\.js$/.test(path));
        }

        async loadTestsAsync(fileName: string) {
            var module = await SystemJS.import(fileName.replace((<any>SystemJS).baseURL, '').replace('.js', ''));
            if (Object.prototype.hasOwnProperty.call(module, "main"))
                module.main(); //expose the tests
        }


    }

    __sharpangles.bootstrapAsync("@scopegoeshere/stuff.anything", "test", "src/index", "/base", undefined, undefined, () => Promise.resolve()).then(() => new __sharpangles.__sharpanglesKarmaInitializerAngularDevelopment().runAsync());
}
