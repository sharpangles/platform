/// <reference path="./karma_entry_point.ts" />

// Cancel Karma's synchronous start, we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function () { };

//var __sharpanglesTestDependencies: any[] = [];

namespace __sharpangles {
    export class KarmaAngularEntryPoint extends KarmaEntryPoint {
        async ensureKarmaTestsLoadedAsync() {
            //__sharpangles.hackXHRForDynamicAngular();
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
            await super.ensureKarmaTestsLoadedAsync();
        }
    }
}
