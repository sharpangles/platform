/// <reference path="../../../entry_point.ts" />
/// <reference path="./systemjs_module_loader.ts" />

namespace __sharpangles {
    export class SystemJSBrowserEntryPoint extends EntryPoint<SystemJSModuleLoaderConfig> {
        constructor(private systemJsPath: string,
            dependencyModulePolicy: DependencyModulePolicy<SystemJSModuleLoaderConfig>,
            libraryPolicy: LibraryPolicy<SystemJSModuleLoaderConfig>,
            features?: Feature | Feature[]) {
            super(dependencyModulePolicy, libraryPolicy, features);
        }

        private _browserModuleLoader = new BrowserModuleLoader();

        protected async bootstrapAsync() {
            // Create a separate browser-level (i.e. script tag) polyfiller to handle the presence of systemjs itself, prior to any other module work.
            let browserPolyfiller = new Polyfiller(this._browserModuleLoader);
            browserPolyfiller.registerPolyfill(this.systemJsPath, () => typeof System === 'undefined', undefined, true);
            await browserPolyfiller.ensureAllAsync();
            await super.bootstrapAsync();
        }

        protected createModuleLoader() {
            return new SystemJSModuleLoader(this._browserModuleLoader);
        }
    }
}
