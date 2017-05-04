import { ImportingLibraryResolver } from '../../platform-global/src/features/libraries/importing_library_resolver';
import { EntryPoint } from '../../platform-global/src/entry_point';
import { ModuleLoader } from '../../platform-global/src/features/module_loaders/module_loader';
import { LibraryFeature } from '../../platform-global/src/features/libraries/library_feature';
import { Library } from '../../platform-global/src/features/libraries/library';
import { FeatureReference } from '../../platform-global/src/features/feature_reference';
import { SystemJSModuleLoader } from '../../platform-global/src/features/systemjs/systemjs_module_loader';
import { AngularSystemJSConfigFeature } from '../../platform-global/src/features/angular/angular_systemjs_config_feature';

let initialSystemJSConfig = {
    warnings: true,
    map: {
        'core-js/es7/reflect': 'core-js/client/shim.js'
    },
    packages: {
        // 'core-js': {
        //    defaultExtension: 'js'
        // },
        '@sharpangles/sample-web': {
            defaultExtension: 'js',
            map: {
                './': '__artifacts/local/app/sample-web/'
            }
        }
    },
    paths: {
        'npm:': '/node_modules/',
        'npm:@sharpangles/': '/libraries/',
        'core-js/': 'node_modules/core-js/',
        // '@sharpangles/sample-web/': '__artifacts/serve/app.umd.js'
    }
};


let entryPoint = new EntryPoint();
entryPoint.withDependency(SystemJSModuleLoader, () => new SystemJSModuleLoader(initialSystemJSConfig, '__artifacts/serve/polyfills/system.src.js')).as(ModuleLoader);
entryPoint.withDependency(LibraryFeature, () => new LibraryFeature(new ImportingLibraryResolver(undefined, ctx => !ctx.key.startsWith('@sharpangles/sample-web'))));
// entryPoint.withDependency(LibraryFeature, () => new LibraryFeature(new StagedLibraryResolver([configLibraryResolver, packageLibraryResolver])));
entryPoint.withDependency(AngularSystemJSConfigFeature, () => new AngularSystemJSConfigFeature('/node_modules/', true, true, undefined, true));
entryPoint.startAsync().then(() => FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync({ key: '@sharpangles/sample-web' }));
