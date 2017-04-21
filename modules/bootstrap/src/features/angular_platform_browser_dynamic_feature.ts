/// <reference path="./angular_platform_feature.ts" />

namespace __sharpangles {
    export class AngularPlatformBrowserDynamicFeature extends AngularPlatformFeature {
        constructor(entryModuleName: string, _dependencies?: Feature[]) {
            super(entryModuleName, '@angular/platform-browser-dynamic', _dependencies);
        }

        protected bootstrap(platformModule: any, entryModule: any) {
            platformModule.platformBrowserDynamic().bootstrapModule(entryModule.AppModule);
        }
    }
}
