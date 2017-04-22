/// <reference path="../feature.ts" />

namespace __sharpangles {
    export abstract class AngularPlatformFeature extends Feature {
        constructor(public entryModuleName: string, public platformModuleName: string, _dependencies?: Feature[]) {
            super(_dependencies);
        }

        dependsOn(feature: Feature) {
            return feature instanceof CoreJSFeature;
        }

        protected async onStartedAsync(entryPoint: EntryPoint<any>) {
            let platformModule = await entryPoint.moduleLoader.loadModuleAsync(this.platformModuleName);
            let entryModule = await entryPoint.moduleLoader.loadModuleAsync(this.entryModuleName);
            this.bootstrap(platformModule, entryModule);
        }

        protected abstract bootstrap(platformModule: any, entryModule: any): void;
    }
}
