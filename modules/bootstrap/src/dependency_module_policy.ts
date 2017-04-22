/// <reference path="./dependency.ts" />

namespace __sharpangles {
    /**
     * Describes how to locate and extract dependencies from a library.
     */
    export interface DependencyModulePolicy<TModuleLoaderConfig = any> {
        /** Returns true of the module is part of a dependency-participating library. */
        isDependencyParticipant(moduleName?: string): boolean;

        /** Gets the name of the module from which to extract the dependency metadata. */
        resolveDependencyModuleName(moduleName?: string): string;

        /** Extracts the child dependencies from the provided loaded module. */
        getDependenciesFromModule(depsModule: any): { [key: string]: Dependency<TModuleLoaderConfig> };
    }

    /**
     * Gets dependencies assuming modules exist in the root and are named as 'dependencies.{environment}' for packages having a matching package scope.
     */
    export class ScopedDependencyModulePolicy<TModuleLoaderConfig = any> implements DependencyModulePolicy<TModuleLoaderConfig> {
        /**
         *
         * @param rootDependency A dependency that represents the application itself.
         */
        constructor(public scope: string, public dependencyModuleLocation = 'dependencies', public dependencyModuleExport?: string) {
        }

        /**
         * Determines if the module name participates in the dependency mechanism.
         * The base implementation determines this by a matching scope on the package.
         */
        isDependencyParticipant(moduleName?: string): boolean {
            return !moduleName || this.scope === ScopedDependencyModulePolicy.getScope(moduleName);
        }

        /**
         * Gets the name of the module from which to extract the dependency metadata.
         */
        resolveDependencyModuleName(moduleName?: string) {
            return moduleName ? `${moduleName}/${this.dependencyModuleLocation}` : this.dependencyModuleLocation;
        }

        getDependenciesFromModule(depsModule: any): { [key: string]: Dependency<TModuleLoaderConfig> } {
            return this.dependencyModuleExport ? depsModule[this.dependencyModuleExport] : depsModule.default;
        }

        static getScope(name: string): string | undefined {
            return name && name.charAt(0) === '@' ? name.indexOf('/') > 0 ? name.substr(0, name.indexOf('/')) : name : undefined;
        }
    }
}
