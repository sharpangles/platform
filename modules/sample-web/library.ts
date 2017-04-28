import { Library } from '../platform-global/src/features/libraries/library';
import { FeatureReference } from '../platform-global/src/features/feature_reference';
import { AngularPlatformBrowserDynamicFeature } from '../platform-global/src/features/angular/angular_platform_browser_dynamic_feature';
import { AppModule } from './src/app.module';

export default <Library>{
    featureReferences: [
        new FeatureReference(AngularPlatformBrowserDynamicFeature, () => new AngularPlatformBrowserDynamicFeature(AppModule))
    ]
};
