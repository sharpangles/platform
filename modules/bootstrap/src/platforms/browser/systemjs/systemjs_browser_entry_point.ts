/// <reference path="../../../entry_point.ts" />
/// <reference path="./systemjs_bundle_dependency_policy.ts" />
/// <reference path="./systemjs_module_loader.ts" />

namespace __sharpangles {
    export class SystemJSBrowserEntryPoint extends EntryPoint<SystemJSModuleLoaderConfig> {
        constructor(public dependencyPolicy: DependencyPolicy<SystemJSModuleLoaderConfig>, public baseUrl: string = '/') {
            super(dependencyPolicy, baseUrl);
        }

        private _browserModuleLoader = new BrowserModuleLoader(this.baseUrl);

        protected createPolyfiller() {
            let polyfiller = new Polyfiller(this._browserModuleLoader, this.baseUrl);
            polyfiller.registerPolyfill('node_modules/systemjs/dist/system.src.js', () => typeof System === 'undefined', undefined, true);
            return polyfiller.fromES5();
        }

        protected createModuleLoader() {
            return new SystemJSModuleLoader(this._browserModuleLoader, <SystemJSBundleDependencyPolicy>this.dependencyPolicy, this.baseUrl);
        }
    }
}
