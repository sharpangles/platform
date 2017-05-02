import { Library, FeatureReference, AngularPlatformBrowserDynamicFeature } from '@sharpangles/platform-global';
import { AppModule } from './src/app.module';

export default <Library>{
    featureReferences: [
        new FeatureReference(AngularPlatformBrowserDynamicFeature, () => new AngularPlatformBrowserDynamicFeature(AppModule))
    ]
};
