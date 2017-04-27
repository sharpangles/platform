import { ImportingLibraryResolver } from '../../platform-global/src/features/libraries/importing_library_resolver';
import { StagedLibraryResolver } from '../../platform-global/src/features/libraries/staged_library_resolver';
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
            // map: {
            //     './': '__artifacts/build/app/'
            // }
        }
    },
    paths: {
        'npm:': '/node_modules/',
        'npm:@sharpangles/': '/modules/',
        'core-js/': 'node_modules/core-js/',
        '@sharpangles/sample-web': '__artifacts/serve/web.dev.umd.js'
    }
};

let configLibraryResolver = new ImportingLibraryResolver(undefined, '/bundles/config_library', ctx => ctx.key.startsWith('@sharpangles/') && !ctx.key.startsWith('@sharpangles/sample-web') && !ctx.key.endsWith('/library'));
let packageLibraryResolver = new ImportingLibraryResolver(undefined, undefined, ctx => ctx.key.startsWith('@sharpangles/') && !ctx.key.endsWith('/bundles/config_library'));

new EntryPoint()
    .withDependency(SystemJSModuleLoader.create(initialSystemJSConfig, '__artifacts/serve/polyfills/system.src.js').as(ModuleLoader))
    .withDependency(LibraryFeature.create(new StagedLibraryResolver([configLibraryResolver, packageLibraryResolver])))
    .withDependency(AngularSystemJSConfigFeature.create('/node_modules/', true, true, undefined, true))
    .startAsync()
    .then(() => FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync({ key: '@sharpangles/sample-web' }));
