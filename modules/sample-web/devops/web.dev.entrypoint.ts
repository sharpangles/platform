// import { ImportingLibraryResolver } from '@sharpangles/platform-global';
// import { EntryPoint } from '@sharpangles/platform-global';
// import { ModuleLoader } from '@sharpangles/platform-global';
// import { LibraryFeature } from '@sharpangles/platform-global';
// import { Library } from '@sharpangles/platform-global';
// import { FeatureReference } from '@sharpangles/platform-global';
// import { SystemJSModuleLoader } from '@sharpangles/platform-global';
// import { AngularSystemJSConfigFeature } from '@sharpangles/platform-global';
import { ImportingLibraryResolver } from '../../platform-global/src/features/libraries/importing_library_resolver';
import { EntryPoint } from '../../platform-global/src/entry_point';
import { ModuleLoader } from '../../platform-global/src/features/module_loaders/module_loader';
import { LibraryFeature } from '../../platform-global/src/features/libraries/library_feature';
import { Library } from '../../platform-global/src/features/libraries/library';
import { FeatureReference } from '../../platform-global/src/features/feature_reference';
import { SystemJSModuleLoader } from '../../platform-global/src/features/systemjs/systemjs_module_loader';
import { AngularSystemJSConfigFeature } from '../../platform-global/src/features/angular/angular_systemjs_config_feature';
import { CoreJSFeature } from '../../platform-global/src/features/polyfills/corejs_feature';

let initialSystemJSConfig = {
    warnings: true,
    map: {
        'core-js/es7/reflect': 'core-js/client/shim.js' // @todo features for this
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
        '@sharpangles/sample-web': '__artifacts/serve/web.dev.umd.js',
        '@sharpangles/sample-web/library': '__artifacts/serve/web.dev.umd.js'
    }
};

// export * from '../../platform-global/index';

// let configLibraryResolver = new ImportingLibraryResolver(undefined, '/bundles/config_library', ctx => ctx.key.startsWith('@sharpangles/') && !ctx.key.startsWith('@sharpangles/sample-web') && !ctx.key.endsWith('/library'));
// let packageLibraryResolver = new ImportingLibraryResolver(undefined, undefined, ctx => ctx.key.startsWith('@sharpangles/') && !ctx.key.endsWith('/bundles/config_library'));
export let entryPoint = new EntryPoint(); // Something has to be exported, otherwise the global isnt set in umd by rollup.
entryPoint.withDependency(SystemJSModuleLoader, () => new SystemJSModuleLoader(initialSystemJSConfig, '__artifacts/serve/polyfills/system.src.js')).as(ModuleLoader);
entryPoint.withDependency(LibraryFeature, () => new LibraryFeature(new ImportingLibraryResolver(undefined, undefined, ctx => ctx.key.startsWith('@sharpangles/'))));
// entryPoint.withDependency(LibraryFeature, () => new LibraryFeature(new StagedLibraryResolver([configLibraryResolver, packageLibraryResolver])));
entryPoint.withDependency(AngularSystemJSConfigFeature, () => new AngularSystemJSConfigFeature('/node_modules/', true, true, undefined, true));
entryPoint.withDependency(CoreJSFeature, () => {
    let feature = new CoreJSFeature(true);
    feature.addDependency(SystemJSModuleLoader);
    return feature;
});
entryPoint.startAsync().then(() =>
    FeatureReference.getFeature<ModuleLoader>(ModuleLoader).loadModuleAsync({ key: '@sharpangles/sample-web' }));
// @todo Root loader?  trigger module loads option for library chain?


// LEFT OFF HERE: Need a static list of potential features.  Thats what this is... it can export the features used.
// That, and endpoints are ultimately going to be auto-built anyway.
// Need a better process for explicit foreknowledge tree-shaking.  rxjs, our own libraries, platform-global features...
// Its still a mess, magically wiring up the global/module space...
