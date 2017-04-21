/// <reference path="../feature.ts" />

namespace __sharpangles {
    export class AngularTestingBrowserDynamicFeature extends AngularTestingFeature {
        constructor(_dependencies?: Feature[]) {
            super('@angular/platform-browser-dynamic/testing', 'BrowserDynamicTestingModule', 'platformBrowserDynamicTesting', _dependencies);
        }
    }
}
