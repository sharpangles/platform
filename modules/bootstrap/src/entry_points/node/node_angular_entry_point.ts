/// <reference path="../../EntryPoint.ts" />

require('tsconfig-paths/register');
require('core-js/es7/reflect');
require('zone.js/dist/zone-node.js');
require('zone.js/dist/long-stack-trace-zone.js');
require('zone.js/dist/proxy.js');
require('zone.js/dist/sync-test.js');
require('zone.js/dist/async-test.js');
require('zone.js/dist/fake-async-test.js');
const Jasmine = require('jasmine');

const runner = new Jasmine();

global.jasmine = runner.jasmine;

require('zone.js/dist/jasmine-patch.js');

const { getTestBed } = require('@angular/core/testing');
const { ServerTestingModule, platformServerTesting } = require('@angular/platform-server/testing');

getTestBed().initTestEnvironment(ServerTestingModule, platformServerTesting());

runner.loadConfig({
  spec_dir: '__artifacts/local/spec',
  spec_files: [ '**/*.spec.js' ]
});

runner.execute();

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
