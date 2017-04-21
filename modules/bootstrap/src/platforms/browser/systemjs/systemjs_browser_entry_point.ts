/// <reference path="../../../entry_point.ts" />
/// <reference path="./systemjs_bundle_dependency_policy.ts" />
/// <reference path="./systemjs_module_loader.ts" />

namespace __sharpangles {
    export class SystemJSBrowserEntryPoint extends EntryPoint<SystemJSModuleLoaderConfig> {
        constructor(private systemJsPath: string, public dependencyPolicy: DependencyPolicy<SystemJSModuleLoaderConfig>, public features: Feature[] = [], public baseUrl: string = '/') {
            super(dependencyPolicy, features, baseUrl);
        }

        private _browserModuleLoader = new BrowserModuleLoader(this.baseUrl);

        protected async bootstrapAsync() {
            // Create a browser-level (i.e. script tag) polyfiller to handle the presence of systemjs itself, prior to any other module work.
            let browserPolyfiller = new Polyfiller(this._browserModuleLoader, this.baseUrl);
            browserPolyfiller.registerPolyfill(this.systemJsPath, () => typeof System === 'undefined', undefined, true);
            await browserPolyfiller.ensureAllAsync();
            await super.bootstrapAsync();
        }

        protected createPolyfiller() {
            let polyfiller = super.createPolyfiller();
            polyfiller.registerPolyfill(this.systemJsPath, () => typeof System === 'undefined', undefined, true);
            return polyfiller;
        }

        protected createModuleLoader() {
            return new SystemJSModuleLoader(this._browserModuleLoader, <SystemJSBundleDependencyPolicy>this.dependencyPolicy, this.baseUrl);
        }
    }
}
