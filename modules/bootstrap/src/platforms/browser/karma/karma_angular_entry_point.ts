/// <reference path="./karma_entry_point.ts" />

namespace __sharpangles {
    export class KarmaAngularEntryPoint extends KarmaEntryPoint {
        async ensureKarmaTestsLoadedAsync() {
            // __sharpangles.hackXHRForDynamicAngular();
            let testBed = (await this.moduleLoader.loadModuleAsync('@angular/core/testing')).TestBed;
            let testing = await this.moduleLoader.loadModuleAsync('@angular/platform-browser-dynamic/testing');
            testBed.initTestEnvironment(testing.BrowserDynamicTestingModule, testing.platformBrowserDynamicTesting());
            await super.ensureKarmaTestsLoadedAsync();
        }

        protected createPolyfiller() {
            let polyfiller = super.createPolyfiller();
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/zone-node.js');
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/long-stack-trace-zone.js');
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/proxy.js');
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/sync-test.js');
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/async-test.js');
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/fake-async-test.js');
            polyfiller.registerPolyfill('/base/node_modules/zone.js/dist/jasmine-patch.js');
            return polyfiller;
        }
    }
}
