import { ModuleLoader } from '../module_loaders/module_loader';
import { FeatureReference } from '../feature_reference';
import { CoreJSFeature } from '../polyfills/corejs_feature';
import { platformBrowser } from '@angular/platform-browser';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularPlatformBrowserFeature extends AngularPlatformFeature {
    static create(rootModuleReference: string | any): FeatureReference {
        return new FeatureReference(AngularPlatformBrowserFeature, () => new AngularPlatformBrowserFeature(rootModuleReference)).withDependency(CoreJSFeature).withDependency(ModuleLoader);
    }

    constructor(rootModuleReference: string | any) {
        super(rootModuleReference);
    }

    protected async bootstrap(rootModule: any) {
        platformBrowser().bootstrapModuleFactory(rootModule);
    }
}
