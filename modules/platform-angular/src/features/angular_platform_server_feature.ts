import { platformServer } from '@angular/platform-server';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularPlatformServerFeature extends AngularPlatformFeature {
    constructor(rootModuleReference: string | any) {
        super(rootModuleReference);
    }

    protected async bootstrap(rootModule: any) {
        platformServer().bootstrapModuleFactory(rootModule);
    }
}
