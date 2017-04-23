/// <reference path="./dependency.ts" />

namespace __sharpangles {
    export interface LibraryPolicy<TModuleLoaderConfig = any> {
        /** Infer a new dependency on the fly from a module name. If not provided, the dependency is for the root application. */
        inferDependency(moduleName?: string): Dependency<TModuleLoaderConfig>;
    }

    /**
     * An opinionated mechanism for working with dependencies in an enterprise culture.
     */
    export class DefaultLibraryPolicy<TModuleLoaderConfig = any> implements LibraryPolicy<TModuleLoaderConfig> {
        constructor() {
        }

        /**
         * Infer a new dependency on the fly from a module name.
         * This is used to wire up something without known dependencies.
         */
        inferDependency(moduleName?: string): Dependency<TModuleLoaderConfig> {
            return <Dependency<TModuleLoaderConfig>>{ name: moduleName };
        }
    }

    /**
     * A policy that handles root applications different from the rest.
     */
    export class SplitLibraryPolicy<TModuleLoaderConfig = any> implements LibraryPolicy<TModuleLoaderConfig> {
        constructor(public rootPolicy: LibraryPolicy<TModuleLoaderConfig>, public dependenciesPolicy: LibraryPolicy<TModuleLoaderConfig>) {
        }

        /**
         * Infer a new dependency on the fly from a module name.
         * This is used to wire up something without known dependencies.
         */
        inferDependency(moduleName?: string): Dependency<TModuleLoaderConfig> {
            return moduleName ? this.dependenciesPolicy.inferDependency(moduleName) : this.rootPolicy.inferDependency(moduleName);
        }
    }
}
