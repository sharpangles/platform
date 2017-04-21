/// <reference path="../bootstrap/src/dependency.ts" />
/// <reference path="../bootstrap/src/dependency_policy.ts" />
/// <reference path="../bootstrap/src/platforms/browser/systemjs/systemjs_bundle_dependency_policy.ts" />
/// <reference path="../bootstrap/src/platforms/browser/systemjs/systemjs_browser_entry_point.ts" />
/// <reference path="../bootstrap/src/features/angular_platform_browser_dynamic_feature.ts" />
/// <reference path="../bootstrap/src/features/corejs_feature.ts" />
/// <reference path="../bootstrap/src/feature.ts" />

// tslint:disable-next-line:class-name
class __EntryPoint_Web_Dev extends __sharpangles.SystemJSBrowserEntryPoint {
    constructor() {
        super('node_modules/systemjs/dist/system.src.js', new __sharpangles.SystemJSBundleDependencyPolicy({
            name: '@sharpangles/sample-web',
            moduleLoaderConfig: {
                systemConfig: {
                    bundles: {
                        'app.umd.js': [
                            'index',
                            'dependencies',
                            'src/*'
                        ]
                    }
                },
                systemPackageConfig: {
                    main: 'index',
                    defaultExtension: false,
                    format: 'umd'
                }
            },
        }), <__sharpangles.Feature[]>[new __sharpangles.CoreJSFeature(), new __sharpangles.AngularPlatformBrowserDynamicFeature('app.module')]);
    }
}

new __EntryPoint_Web_Dev().startAsync();
