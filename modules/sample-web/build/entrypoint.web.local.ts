/// <reference path="../../bootstrap/src/dependency.ts" />
/// <reference path="../../bootstrap/src/dependency_module_policy.ts" />
/// <reference path="../../bootstrap/src/platforms/browser/systemjs/systemjs_bundle_library_policy.ts" />
/// <reference path="../../bootstrap/src/platforms/browser/systemjs/systemjs_browser_entry_point.ts" />
/// <reference path="../../bootstrap/src/features/angular_platform_browser_dynamic_feature.ts" />
/// <reference path="../../bootstrap/src/features/corejs_feature.ts" />
/// <reference path="../../bootstrap/src/features/systemjs_config_feature.ts" />
/// <reference path="../../bootstrap/src/feature.ts" />

/**
 * A local entry point convenient for development.
 * This particular example is set up around running an http-server at the platform root.
 */
class __EntryPoint_Web_Local extends __sharpangles.SystemJSBrowserEntryPoint { // tslint:disable-line:class-name
    constructor() {
        super('__artifacts/serve/polyfills/system.src.js',
            new __sharpangles.ScopedDependencyModulePolicy('@sharpangles', '@sharpangles/sample-web/build/dependencies.local'),
            new __sharpangles.SystemJSBundleLibraryPolicy(),
            <__sharpangles.Feature[]>[
                new __sharpangles.CoreJSFeature(),
                new __sharpangles.AngularPlatformBrowserDynamicFeature('app.module'),
                new __sharpangles.SystemJSConfigFeature({
                    warnings: true,
                    packages: {
                        'core-js': {
                            defaultExtension: 'js'
                        },
                        '@sharpangles/sample-web/': {
                            defaultExtension: 'js'
                        }
                    },
                    paths: {
                        'npm:': '/node_modules/',
                        'npm:@sharpangles/': '/modules/',
                        'core-js/': 'node_modules/core-js/',
                        '@sharpangles/sample-web/': '__artifacts/build/app/'
                    }
                })
            ]);
    }
}

new __EntryPoint_Web_Local().startAsync();
