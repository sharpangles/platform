/// <reference path="../../../dependency.ts" />
/// <reference path="../../../dependency_module_policy.ts" />

namespace __sharpangles {

    /**
     * A policy that uses a scoped package name and assumes each module has a single bundle.
     */
    export class SystemJSLibraryPolicy implements LibraryPolicy<SystemJSModuleLoaderConfig> {
        constructor(public baseUrl = '/') {
        }

        inferDependency(moduleName?: string): Dependency<SystemJSModuleLoaderConfig> {
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
            if (!moduleName)
                return;
            return {
                main: 'index',
                defaultExtension: false,
                format: 'umd'
            };
        }
    }
}
