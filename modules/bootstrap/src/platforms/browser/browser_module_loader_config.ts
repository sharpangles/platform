namespace __sharpangles {
    export interface BrowserModuleLoaderConfig {
        src: string;

        /** If true, the script tag will use the module type. */
        isModule?: boolean;
        isDeferred?: boolean;
        isAsync?: boolean;
    }
}
