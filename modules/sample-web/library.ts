import { Library } from '../platform-global/src/features/libraries/library';
import { AngularPlatformBrowserDynamicFeature } from '../platform-global/src/features/angular/angular_platform_browser_dynamic_feature';
import { AppModule } from './src/app.module';

export default <Library>{
    featureReferences: [
        AngularPlatformBrowserDynamicFeature.create(AppModule)
    ]
};
