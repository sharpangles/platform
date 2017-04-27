import { FeatureReference } from '../feature_reference';
import { CoreJSFeature } from '../polyfills/corejs_feature';
import { platformServer } from '@angular/platform-server';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularPlatformServerFeature extends AngularPlatformFeature {
    static create(rootModuleReference: string | any): FeatureReference {
        return new FeatureReference(AngularPlatformServerFeature, () => new AngularPlatformServerFeature(rootModuleReference)).withDependency(CoreJSFeature);
    }

    constructor(rootModuleReference: string | any) {
        super(rootModuleReference);
    }

    protected async bootstrap(rootModule: any) {
        platformServer().bootstrapModuleFactory(rootModule);
    }
}
