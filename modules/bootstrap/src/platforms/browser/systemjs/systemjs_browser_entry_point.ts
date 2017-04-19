/// <reference path="../../../entry_point.ts" />
/// <reference path="./systemjs_bundle_dependency_policy.ts" />
/// <reference path="./systemjs_module_loader.ts" />

namespace __sharpangles {
    export class SystemJSBrowserEntryPoint extends EntryPoint<SystemJSModuleLoaderConfig> {
        constructor(public name: string, public dependencyPolicy: DependencyPolicy<SystemJSModuleLoaderConfig>, public baseUrl: string = '/') {
            super(name, dependencyPolicy, baseUrl)
        }

        protected createPolyfiller() {
            var polyfiller = super.createPolyfiller();
            polyfiller.registerPolyfill("node_modules/systemjs/dist/system.src.js", () => typeof System == "undefined");
            return polyfiller;
        }

        protected createModuleLoader() {
            return new SystemJSModuleLoader(new BrowserModuleLoader(this.baseUrl), <SystemJSBundleDependencyPolicy>this.dependencyPolicy, this.baseUrl);
        }
    }
}
