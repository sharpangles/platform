namespace __sharpangles {
    /**
     * Dependencies allow dynamic modules discovered at runtime to inject configuration into the bootstrapper.
     * Currently, they deal with dynamically configuring the module loader, but could be extended to do more,
     * perhaps sandboxing in webworkers and web components or production hot-module reload handling.
     */
    export interface Dependency<TModuleLoaderConfig = any> {
        /** The module name to use for module loader configuration. */
        name?: string;

        moduleLoaderConfig?: TModuleLoaderConfig;

        /**
         * Dependencies that are known ahead of time, otherwise they are discovered in iterations over the features.
         * Typically for bundling techniques, unrolling dependencies is unnecessary, however may still be required
         * to create dependency chains through non-dependency-aware modules.
         */
        knownDependencies?: { [key: string]: Dependency<TModuleLoaderConfig> };

        /** Stores dependencies as they are discovered during the bootstrapping process. */
        dependencies?: string[];
    }
}
