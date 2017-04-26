import { ZoneJSTestingFeature } from './zonejs_testing_feature';
import { FeatureReference } from '../feature';
import { CoreJSFeature } from '../polyfills/corejs_feature';
import { getTestBed } from '@angular/core/testing';
import { platformBrowserDynamicTesting, BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularTestingBrowserDynamicFeature extends AngularPlatformFeature {
    static create(): FeatureReference {
        return new FeatureReference(AngularTestingBrowserDynamicFeature, () => new AngularTestingBrowserDynamicFeature(BrowserDynamicTestingModule)).withDependency(CoreJSFeature).withDependency(ZoneJSTestingFeature);
    }

    protected async bootstrap(rootModule: any) {
        getTestBed().initTestEnvironment(rootModule, platformBrowserDynamicTesting());
    }
}
