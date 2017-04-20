/// <reference path="../../../dependency.ts" />
/// <reference path="../../../dependency_policy.ts" />

namespace __sharpangles {

    /**
     * A policy that uses a scoped package name and assumes each module has a single bundle.
     */
    export class SystemJSBundleDependencyPolicy extends DependencyPolicy<SystemJSModuleLoaderConfig> {
        constructor(rootDependency: Dependency<SystemJSModuleLoaderConfig>, public localCodePaths = ['src'], environmentExtension?: string, dependencyModuleLocation: string = 'dependencies', dependencyModuleExport?: string) {
            super(rootDependency, environmentExtension, dependencyModuleLocation, dependencyModuleExport);
        }

        /**
         * Infer a new dependency on the fly from a module name.
         */
        createDynamicDependency(moduleName: string): Dependency<SystemJSModuleLoaderConfig> {
            let dependency = <Dependency<SystemJSModuleLoaderConfig>>{
                name: moduleName,
                moduleLoaderConfig: <SystemJSModuleLoaderConfig>{
                    systemConfig: {
                        bundles: {}
                    },
                    systemPackageConfig: {
                        main: 'src/index',
                        defaultExtension: false,
                        format: 'system'
                    }
                }
            };
            (<any>dependency.moduleLoaderConfig).systemConfig.bundles[`/npm:${moduleName}/dist/${moduleName.replace('/', '.').replace('@', '')}.${this.environmentExtension}.js`] = [
                `${this.scope}/${moduleName}`,
                `${this.scope}/${moduleName}/*`
            ];
            return dependency;
        }
    }
}
