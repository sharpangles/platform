/// <reference path="../../bootstrap/src/dependency.ts" />
/// <reference path="../../bootstrap/src/dependency_policy.ts" />
/// <reference path="../../bootstrap/src/platforms/browser/systemjs/systemjs_bundle_library_policy.ts" />
/// <reference path="../../bootstrap/src/platforms/browser/systemjs/systemjs_browser_entry_point.ts" />
/// <reference path="../../bootstrap/src/features/angular_platform_browser_dynamic_feature.ts" />
/// <reference path="../../bootstrap/src/features/corejs_feature.ts" />
/// <reference path="../../bootstrap/src/features/systemjs_config_feature.ts" />
/// <reference path="../../bootstrap/src/feature.ts" />

/**
 * An entrypoint useful for a development deployment that includes source maps.
 */
class __EntryPoint_Web_Dev extends __sharpangles.SystemJSBrowserEntryPoint { // tslint:disable-line:class-name
    constructor() {
        super('polyfills/system.src.js',
            new __sharpangles.ScopedDependencyModulePolicy('@sharpangles', 'dev'),
            new __sharpangles.SystemJSBundleLibraryPolicy(),
            [
                new __sharpangles.CoreJSFeature(),
                new __sharpangles.AngularPlatformBrowserDynamicFeature('app.module'),
                new __sharpangles.SystemJSConfigFeature({
                })
            ]);
    }
}

new __EntryPoint_Web_Dev().startAsync();
