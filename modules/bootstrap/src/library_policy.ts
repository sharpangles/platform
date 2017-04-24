/// <reference path="./dependency.ts" />

namespace __sharpangles {
    export interface LibraryPolicy<TModuleLoaderConfig = any> {
        /**
         * Given a dependency name, this method discovers if the dependency participates in this library feature.
         * If it does, it infers or resolves the library, otherwise undefined is returned.
         */
        getLibraryModuleAsync(dependencyName?: string): Promise<Library | undefined>;
    }

    /**
     * An opinionated mechanism for working with dependencies in an enterprise culture.
     */
    export class DefaultLibraryPolicy<TModuleLoaderConfig = any> implements LibraryPolicy<TModuleLoaderConfig> {
        constructor() {
        }

        /**
         * Determines if the module name participates in the library mechanism.
         * The base implementation determines this by a matching scope on the package.
         */
        /**
         * Infer a new dependency on the fly from a module name.
         * This is used to wire up something without known dependencies.
         */
        inferLibrary(moduleName?: string): Dependency<TModuleLoaderConfig> {
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
        inferLibrary(moduleName?: string): Library {
            return moduleName ? this.dependenciesPolicy.inferDependency(moduleName) : this.rootPolicy.inferDependency(moduleName);
        }
    }
}
