import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularPlatformBrowserDynamicFeature extends AngularPlatformFeature {
    constructor(rootModuleReference: string | any) {
        super(rootModuleReference);
    }

    protected async bootstrap(rootModule: any) {
        platformBrowserDynamic().bootstrapModule(rootModule);
    }
}
