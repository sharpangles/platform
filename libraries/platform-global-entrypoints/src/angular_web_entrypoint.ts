import { EntryPoint, ImportingLibraryResolver, LibraryFeature, ModuleLoader, FeatureReference, SystemJSModuleLoader, AngularSystemJSConfigFeature } from '@sharpangles/platform-global';

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
        'npm:@sharpangles/': '/libraries/',
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
