/// <reference path="./node_entry_point.ts" />

namespace __sharpangles {
    export class NodeAngularEntryPoint extends NodeEntryPoint {
        constructor(public name: string, public dependencyPolicy: DependencyPolicy<any>) {
            super(name, dependencyPolicy);
        }

        protected async initEnvironmentAsync() {
            //__sharpangles.hackXHRForDynamicAngular();
            await this.moduleLoader.ensureAllLoadedAsync();
            const Jasmine = await this.moduleLoader.loadModuleAsync('jasmine');
            const runner = new Jasmine();
            (<any>global).jasmine = runner.jasmine;
            this.polyfiller.registerPolyfill('zone.js/dist/jasmine-patch.js');
            await this.polyfiller.ensureAllAsync();
            let testBed = (await this.moduleLoader.loadModuleAsync('@angular/core/testing')).TestBed;
            let testing = await this.moduleLoader.loadModuleAsync('@angular/platform-server/testing');
            testBed.initTestEnvironment(testing.ServerTestingModule, testing.platformServerTesting());
            runner.loadConfig({
                spec_dir: '__artifacts/local/spec',
                spec_files: [ '**/*.spec.js' ]
            });
            runner.execute();
        }

        protected createPolyfiller() {
            var polyfiller = super.createPolyfiller();
            polyfiller.registerPolyfill("/base/node_modules/zone.js/dist/zone-node.js");
            polyfiller.registerPolyfill("/base/node_modules/zone.js/dist/long-stack-trace-zone.js");
            polyfiller.registerPolyfill("/base/node_modules/zone.js/dist/proxy.js");
            polyfiller.registerPolyfill("/base/node_modules/zone.js/dist/sync-test.js");
            polyfiller.registerPolyfill("/base/node_modules/zone.js/dist/async-test.js");
            polyfiller.registerPolyfill("/base/node_modules/zone.js/dist/fake-async-test.js");
            return polyfiller;
        }
    }
}
