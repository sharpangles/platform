import { ZoneJSTestingFeature } from './zonejs_testing_feature';
import { FeatureReference } from '../feature';
import { CoreJSFeature } from '../polyfills/corejs_feature';
import { getTestBed } from '@angular/core/testing';
import { platformServerTesting, ServerTestingModule } from '@angular/platform-server/testing';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularTestingServerFeature extends AngularPlatformFeature {
    static create(): FeatureReference {
        return new FeatureReference(AngularTestingServerFeature, () => new AngularTestingServerFeature(ServerTestingModule)).withDependency(CoreJSFeature).withDependency(ZoneJSTestingFeature);
    }

    protected async bootstrap(rootModule: any) {
        getTestBed().initTestEnvironment(rootModule, platformServerTesting());
    }
}
