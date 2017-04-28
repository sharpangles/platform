import { ZoneJSTestingFeature } from './zonejs_testing_feature';
import { Type } from '../feature_reference';
import { getTestBed } from '@angular/core/testing';
import { platformServerTesting, ServerTestingModule } from '@angular/platform-server/testing';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularTestingServerFeature extends AngularPlatformFeature {
    constructor() {
        super(ServerTestingModule);
    }

    dependentTypes(): Type[] {
        return super.dependentTypes().concat([ZoneJSTestingFeature]);
    }

    protected async bootstrap(rootModule: any) {
        getTestBed().initTestEnvironment(rootModule, platformServerTesting());
    }
}
