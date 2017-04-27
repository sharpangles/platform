import { Library, LazyFeatureContext, FeatureReference, AngularPlatformBrowserFeature } from '@sharpangles/platform-global';
import { SampleDependencyModule } from './src/sample_dependency.module';

export default <Library>{
    capabilityContexts: {
        'LazyFeatureCapability': <LazyFeatureContext>{
            getFeatureReference(): FeatureReference {
                return AngularPlatformBrowserFeature.create(SampleDependencyModule);
            }
        }
    }
};
