/// <reference path="../bootstrap/src/dependency.ts" />
/// <reference path="../bootstrap/src/dependency_policy.ts" />
/// <reference path="../bootstrap/src/platforms/browser/systemjs/systemjs_bundle_dependency_policy.ts" />
/// <reference path="../bootstrap/src/platforms/browser/systemjs/systemjs_browser_entry_point.ts" />

// tslint:disable-next-line:class-name
class __EntryPoint_Web_Prod extends __sharpangles.SystemJSBrowserEntryPoint {
    constructor() {
        super(new __sharpangles.SystemJSBundleDependencyPolicy({
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
                }
            }
        }));
    }
}

new __EntryPoint_Web_Prod().startAsync();
