/// <reference path="../../dependency_loader.ts" />
/// <reference path="../../dependency_resolver.ts" />
/// <reference path="../../polyfiller.ts" />
/// <reference path="../../entry_point.ts" />

namespace __sharpangles {
    export class BrowserEntryPoint extends EntryPoint<BrowserModuleLoaderConfig> {
        constructor(dependencyModulePolicy: DependencyModulePolicy<BrowserModuleLoaderConfig>,
            libraryPolicy: LibraryPolicy<BrowserModuleLoaderConfig>,
            features?: Feature | Feature[],
            public baseUrl?: string) {
            super(dependencyModulePolicy, libraryPolicy, features);
        }

        protected createModuleLoader() {
            return new BrowserModuleLoader(this.libraryPolicy, this.baseUrl);
        }
    }
}
