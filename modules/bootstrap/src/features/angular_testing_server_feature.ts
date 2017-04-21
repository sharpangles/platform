/// <reference path="../feature.ts" />

namespace __sharpangles {
    export class AngularTestingServerFeature extends AngularTestingFeature {
        constructor(_dependencies?: Feature[]) {
            super('@angular/platform-server/testing', 'ServerTestingModule', 'platformServerTesting', _dependencies);
        }
    }
}
