import { ZoneJSTestingFeature } from './zonejs_testing_feature';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AngularPlatformFeature } from './angular_platform_feature';
import { Type } from '@sharpangles/platform-global';

export class AngularTestingBrowserDynamicFeature extends AngularPlatformFeature {
    constructor() {
        super(BrowserDynamicTestingModule);
    }

    dependentTypes(): Type[] {
        return super.dependentTypes().concat([ZoneJSTestingFeature]);
    }

    protected async bootstrap(rootModule: any) {
        getTestBed().initTestEnvironment(rootModule, platformBrowserDynamicTesting());
    }
}
