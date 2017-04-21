/// <reference path="../feature.ts" />

namespace __sharpangles {
    export class AngularTestingFeature extends Feature {
        constructor(public testPlatformModuleName: string, public testModuleName: string, public testPlatformName: string, _dependencies?: Feature[]) {
            super(_dependencies);
        }

        protected onPolyfillerCreatedAsync(entryPoint: EntryPoint<any>) {
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/zone-node.js');
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/long-stack-trace-zone.js');
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/proxy.js');
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/sync-test.js');
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/async-test.js');
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/fake-async-test.js');
            entryPoint.polyfiller.registerPolyfill('/node_modules/zone.js/dist/jasmine-patch.js');
            return Promise.resolve();
        }

        protected async onStartedAsync(entryPoint: EntryPoint<any>) {
            const modules = await Promise.all([entryPoint.moduleLoader.loadModuleAsync('@angular/core/testing'), entryPoint.moduleLoader.loadModuleAsync(this.testPlatformModuleName)]);
            let testBed = modules[0].getTestBed();
            let testingModule = modules[1][this.testModuleName];
            let platformTesting = modules[1][this.testPlatformName];
            testBed.initTestEnvironment(testingModule, platformTesting());
        }
    }
}
