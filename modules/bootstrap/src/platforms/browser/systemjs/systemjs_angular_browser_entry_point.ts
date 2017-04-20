/// <reference path="../../../entry_point.ts" />
/// <reference path="./systemjs_bundle_dependency_policy.ts" />
/// <reference path="./systemjs_angular_module_loader_config.ts" />
/// <reference path="./systemjs_browser_entry_point.ts" />
/// <reference path="./systemjs_module_loader.ts" />

namespace __sharpangles {
    export class SystemJSAngularBrowserEntryPoint extends SystemJSBrowserEntryPoint {
        constructor(public dependencyPolicy: DependencyPolicy<SystemJSAngularModuleLoaderConfig>, public baseUrl: string = '/') {
            super(dependencyPolicy, baseUrl);
        }

        async startAsync(): Promise<void> {
            await super.startAsync();
            if (!this.dependencyPolicy.rootDependency.moduleLoaderConfig)
                return;
            let ngPlatform = await this.moduleLoader.loadModuleAsync(this.dependencyPolicy.rootDependency.moduleLoaderConfig.platform);
            let appModule = await this.moduleLoader.loadModuleAsync(this.dependencyPolicy.rootDependency.moduleLoaderConfig.moduleName);
            ngPlatform.platformBrowserDynamic().bootstrapModule(appModule.AppModule);
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
