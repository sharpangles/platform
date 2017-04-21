/// <reference path="../feature.ts" />

namespace __sharpangles {
    export class AngularPlatformServerFeature extends AngularPlatformFeature {
        constructor(entryModuleName: string, public isDynamic?: boolean, _dependencies?: Feature[]) {
            super(entryModuleName, '@angular/platform-server', _dependencies);
        }

        protected bootstrap(platformModule: any, entryModule: any) {
            if (this.isDynamic)
                platformModule.platformDynamicServer().bootstrapModule(entryModule.AppModule);
            else
                platformModule.platformServer().bootstrapModuleFactory(entryModule.AppModule);
        }
    }
}
