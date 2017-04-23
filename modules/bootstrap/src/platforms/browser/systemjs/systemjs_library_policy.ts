/// <reference path="../../../dependency.ts" />
/// <reference path="../../../dependency_module_policy.ts" />

namespace __sharpangles {

    /**
     * A policy that uses a scoped package name and assumes each module has a single bundle.
     */
    export class SystemJSLibraryPolicy implements LibraryPolicy<SystemJSModuleLoaderConfig> {
        /**
         * @param appModuleName Settings this can simplify configuration scenarios for local builds (i.e. configuring systemjs to load ./src, ./spec, etc...).
         */
        constructor(public appModuleName?: string, public baseUrl = '/') {
        }

        inferDependency(moduleName?: string): Dependency<SystemJSModuleLoaderConfig> {
            moduleName = moduleName || this.appModuleName;
            let moduleLoaderConfig = <SystemJSModuleLoaderConfig>{
                systemConfig: this.createConfig(moduleName),
                systemPackageConfig: this.createPackageConfig(moduleName)
            };
            let dependency = <Dependency<SystemJSModuleLoaderConfig>>{
                name: moduleName,
                moduleLoaderConfig: moduleLoaderConfig
            };
            return dependency;
       }

        protected createConfig(moduleName?: string): SystemJSLoader.Config {
            return moduleName ? {} : {
                transpiler: <any>false,
                packages: <any>{},
                baseURL: this.baseUrl
            };
        }

        protected createPackageConfig(moduleName?: string): SystemJSLoader.Config | undefined {
            return;
            // if (!moduleName)
            //     return;
            // return {
            //     main: 'index',
            //     defaultExtension: false,
            //     format: 'umd'
            // };
        }
    }
}
