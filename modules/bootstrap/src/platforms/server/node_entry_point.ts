/// <reference path="../../entry_point.ts" />
/// <reference path="./commonjs_module_loader.ts" />

namespace __sharpangles {
    export class NodeEntryPoint extends EntryPoint<any> {
        constructor(public name: string, public dependencyPolicy: DependencyPolicy<any>) {
            super(name, dependencyPolicy);
        }

        protected createModuleLoader() {
            return new CommonJSModuleLoader();
        }
    }
}
