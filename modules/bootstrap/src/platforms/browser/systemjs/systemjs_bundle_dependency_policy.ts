/// <reference path="../../../dependency.ts" />
/// <reference path="../../../dependency_policy.ts" />

namespace __sharpangles {
    export interface SystemJSModuleLoaderConfig {
        /** Configuration to merge into SystemJS. */
        systemConfig?: { [key: string]: any };

        /** A shallow-merge of the package configuration. */
        systemPackageConfig?: { [key: string]: any };

        /** If set to a string, that source will be loaded as a script tag. */
        useTag?: string;
    }

    /**
     * A policy that uses a scoped package name and assumes each module has a single bundle.
     */
    export class SystemJSBundleDependencyPolicy extends DependencyPolicy<SystemJSModuleLoaderConfig> {
        constructor(public rootName: string, public localCodePaths = ['src'], public environmentExtension?: string, public dependencyModuleLocation: string = 'dependencies', public dependencyModuleExport?: string) {
            super(rootName, environmentExtension, dependencyModuleLocation, dependencyModuleExport);
        }

        /**
         * Infer a new dependency on the fly from a module name.
         */
        createDynamicDependency(moduleName: string): Dependency<SystemJSModuleLoaderConfig> {
            var dependency = <Dependency<SystemJSModuleLoaderConfig>>{
                name: moduleName,
                moduleLoaderConfig: <SystemJSModuleLoaderConfig>{
                    systemConfig: {
                        bundles: {}
                    },
                    systemPackageConfig: {
                        main: "src/index",
                        defaultExtension: false,
                        format: 'system'
                    }
                }
            };
            (<any>dependency.moduleLoaderConfig).systemConfig.bundles[`/npm:${moduleName}/dist/${moduleName.replace('/', '.').replace('@', '')}.${this.environmentExtension}.js`] = [
                `${this.scope}/${moduleName}`,
                `${this.scope}/${moduleName}/*`,
                `${this.scope}/${moduleName}/src/*`
            ];
            return dependency;
        }
    }
}
