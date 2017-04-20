/// <reference path="../../entry_point.ts" />
/// <reference path="./commonjs_module_loader.ts" />

namespace __sharpangles {
    export class NodeEntryPoint extends EntryPoint<any> {
        constructor(public dependencyPolicy: DependencyPolicy<any>) {
            super(dependencyPolicy);
        }

        protected createModuleLoader() {
            return new CommonJSModuleLoader();
        }
    }
}
