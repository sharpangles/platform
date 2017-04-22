/// <reference path="./angular_platform_feature.ts" />

namespace __sharpangles {
    export class SystemJSConfigFeature extends Feature {
        constructor(public config: SystemJSLoader.Config, _dependencies?: Feature[]) {
            super(_dependencies);
        }

        protected async onModuleLoaderCreatedAsync(entryPoint: EntryPoint<any>) {
            System.config(this.config);
        }
    }
}
