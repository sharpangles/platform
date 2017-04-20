/// <reference path="../browser_module_loader_config.ts" />

namespace __sharpangles {
    export interface SystemJSModuleLoaderConfig {
        /** Configuration to merge into SystemJS. */
        systemConfig?: { [key: string]: any };

        /** A shallow-merge of the package configuration. */
        systemPackageConfig?: { [key: string]: any };

        /**
         * The systemjs module loader includes a reference to the basic browser module loader.
         * Use this to bypass systemJS and be loaded by tag instead.
         */
        browserLoaderConfig?: BrowserModuleLoaderConfig;
    }
}
