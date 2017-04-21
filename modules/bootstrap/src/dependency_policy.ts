/// <reference path="./dependency.ts" />

namespace __sharpangles {
    /**
     * An opinionated mechanism for working with dependencies in an enterprise culture.
     */
    export class DependencyPolicy<TModuleLoaderConfig> {
        /**
         *
         * @param rootName The name used for the application root.
         */
        constructor(public rootDependency: Dependency<TModuleLoaderConfig>, public environmentExtension?: string, public dependencyModuleLocation: string = 'dependencies', public dependencyModuleExport?: string) {
            this.scope = this._getScope(rootDependency.name);
        }

        scope?: string;

        /**
         * Determines if the module name participates in the dependency mechanism.
         * The base implementation determines this by a matching scope on the package.
         */
        isDependencyParticipant(moduleName: string): boolean {
            return this.scope === this._getScope(moduleName);
        }

        /**
         * Infer a new dependency on the fly from a module name.
         */
        createDynamicDependency(moduleName: string): Dependency<TModuleLoaderConfig> {
            return <Dependency<TModuleLoaderConfig>>{ name: moduleName };
        }

        /**
         * Gets the name of the module from which to extract the dependency metadata.
         */
        resolveDependencyModuleName(moduleName: string) {
            let loc = this.dependencyModuleLocation;
            if (this.environmentExtension)
                loc += '.' +  + this.environmentExtension;
            return this.rootDependency.name === moduleName ? loc : `${moduleName}/${loc}`;
        }

        private _getScope(name: string): string | undefined {
            return name && name.charAt(0) === '@' ? name.indexOf('/') > 0 ? name.substr(0, name.indexOf('/')) : name : undefined;
        }
    }
}
