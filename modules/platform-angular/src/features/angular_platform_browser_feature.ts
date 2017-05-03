import { platformBrowser } from '@angular/platform-browser';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularPlatformBrowserFeature extends AngularPlatformFeature {
    constructor(rootModuleReference: string | any) {
        super(rootModuleReference);
    }

    protected async bootstrap(rootModule: any) {
        platformBrowser().bootstrapModuleFactory(rootModule);
    }
}
