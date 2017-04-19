namespace __sharpangles {
    /**
     * Represents an item in the associated export from dependencies.ts.
     * The path 'npm:' is available for use in system configurations.
     */
    export interface Dependency {
        /** The module name to use for module loader configuration. */
        name: string;

        /** Configuration to merge into SystemJS. */
        systemConfig?: { [key: string]: any };

        /** A shallow-merge of the package configuration. */
        systemPackageConfig?: { [key: string]: any };

        /** If set to a string, that source will be loaded as a script tag. */
        useTag?: string;

        /** Dependencies that are known ahead of time, otherwise they are discovered in iterations over the features. */
        knownDependencies?: { [key: string]: Dependency };

        /** Stores dependencies as they are discovered during the bootstrapping process. */
        dependencies?: string[];
    }
}
