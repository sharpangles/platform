/// <reference path="./angular_platform_feature.ts" />

namespace __sharpangles {
    export class AngularPlatformBrowserFeature extends AngularPlatformFeature {
        constructor(entryModuleName: string, _dependencies?: Feature[]) {
            super(entryModuleName, '@angular/platform-browser', _dependencies);
        }

        protected bootstrap(platformModule: any, entryModule: any) {
            platformModule.platformBrowser().bootstrapModuleFactory(entryModule.AppModule);
        }
    }
}
