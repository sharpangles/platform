/// <reference path="../bootstrap/src/dependency.ts" />
/// <reference path="../bootstrap/src/dependency_policy.ts" />
/// <reference path="../bootstrap/src/platforms/browser/systemjs/systemjs_bundle_dependency_policy.ts" />
/// <reference path="../bootstrap/src/platforms/browser/systemjs/systemjs_angular_browser_entry_point.ts" />

// tslint:disable-next-line:class-name
class __CustomEntryPoint extends __sharpangles.SystemJSAngularBrowserEntryPoint {
    constructor() {
        super(<any>new __sharpangles.SystemJSBundleDependencyPolicy(<__sharpangles.Dependency<__sharpangles.SystemJSAngularModuleLoaderConfig>>{
            name: '@sharpangles/sample-web',
            moduleLoaderConfig: {
                systemConfig: {
                    bundles: {
                        'app.umd.js': [
                            'dependencies',
                            'src/*'
                        ]
                    }
                },
                systemPackageConfig: {
                    main: 'src/index',
                    defaultExtension: false,
                    format: 'system'
                },
                entry: ''
            }
        }));
    }
}

new __CustomEntryPoint().startAsync();
