namespace __sharpangles {
    /**
     * Represents an item in the associated export from dependencies.ts.
     * The path 'npm:' is available for use in system configurations.
     */
    export interface Dependency<TModuleLoaderConfig> {
        /** The module name to use for module loader configuration. */
        name: string;

        moduleLoaderConfig?: TModuleLoaderConfig;

        /** Dependencies that are known ahead of time, otherwise they are discovered in iterations over the features. */
        knownDependencies?: { [key: string]: Dependency<TModuleLoaderConfig> };

        /** Stores dependencies as they are discovered during the bootstrapping process. */
        dependencies?: string[];
    }
}
