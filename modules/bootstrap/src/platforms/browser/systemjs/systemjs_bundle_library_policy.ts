/// <reference path="../../../dependency.ts" />
/// <reference path="../../../dependency_module_policy.ts" />
/// <reference path="./systemjs_library_policy.ts" />

namespace __sharpangles {
    /**
     * A policy that uses a scoped package name and assumes each module has a single bundle.
     */
    export class SystemJSBundleLibraryPolicy extends SystemJSLibraryPolicy {
        constructor(public baseUrl = '/', public bundleRoot: string = '', public bundleExtension: string = '') {
            super(baseUrl);
        }

        getBundleName(moduleName: string) {
            return `${this.bundleRoot}/${moduleName.replace('/', '.').replace('@', '')}${this.bundleExtension}.js`;
        }

        protected createConfig(moduleName?: string): SystemJSLoader.Config {
            moduleName = moduleName || `app`;
            let config = super.createConfig(moduleName);
            let bundles = <{ [key: string]: any }>{};
            bundles[this.getBundleName(moduleName)] = [
                `${moduleName}`,
                `${moduleName}/*`
            ];
            config.bundles = bundles;
            return config;
        }
    }
}
