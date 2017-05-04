/// <reference path="../../bootstrap/src/dependency.ts" />
/// <reference path="../../bootstrap/src/dependency_policy.ts" />
/// <reference path="../../bootstrap/src/platforms/browser/systemjs/systemjs_browser_entry_point.ts" />
/// <reference path="../../bootstrap/src/features/angular_platform_browser_feature.ts" />

/**
 * A production-ready fully minified single package build.
 * This entrypoint will be bundled with systemjs and corejs with complex minification.
 * A second bundle for all static dependencies is used with simple minification.
 */
class __EntryPoint_Web_Prod extends __sharpangles.SystemJSBrowserEntryPoint { // tslint:disable-line:class-name
    constructor() {
        super('polyfills/system.src.js',
            new __sharpangles.ScopedDependencyModulePolicy('@sharpangles', 'prod'),
            new __sharpangles.SystemJSBundleLibraryPolicy(),
            <__sharpangles.Feature[]>[
                new __sharpangles.AngularPlatformBrowserFeature('app.module'),
            ]);
    }
}

new __EntryPoint_Web_Prod().startAsync();
