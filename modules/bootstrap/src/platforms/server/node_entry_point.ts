/// <reference path="../../entry_point.ts" />
/// <reference path="./commonjs_module_loader.ts" />

namespace __sharpangles {
    export class NodeEntryPoint extends EntryPoint {
        constructor(dependencyModulePolicy: DependencyModulePolicy, libraryPolicy: LibraryPolicy, features?: Feature | Feature[]) {
            super(dependencyModulePolicy, libraryPolicy, features);
        }

        protected createModuleLoader() {
            return new CommonJSModuleLoader();
        }
    }
}
