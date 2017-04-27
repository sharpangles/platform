import { ModuleLoader } from '../module_loaders/module_loader';
import { FeatureReference } from '../feature_reference';
import { CoreJSFeature } from '../polyfills/corejs_feature';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AngularPlatformFeature } from './angular_platform_feature';

export class AngularPlatformBrowserDynamicFeature extends AngularPlatformFeature {
    static create(rootModuleReference: string | any): FeatureReference {
        return new FeatureReference(AngularPlatformBrowserDynamicFeature, () => new AngularPlatformBrowserDynamicFeature(rootModuleReference)).withDependency(CoreJSFeature).withDependency(ModuleLoader);
    }

    constructor(rootModuleReference: string | any) {
        super(rootModuleReference);
    }

    protected async bootstrap(rootModule: any) {
        platformBrowserDynamic().bootstrapModule(rootModule);
    }
}
