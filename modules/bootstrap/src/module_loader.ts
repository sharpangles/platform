/// <reference path="./dependency.ts" />

namespace __sharpangles {
    /**
     * Implements a mechanism to track the loading of dependencies.
     */
    export abstract class ModuleLoader<TModuleLoaderConfig = any> {
        abstract registerDependency(dependency: Dependency<TModuleLoaderConfig>): void;
        abstract loadModuleAsync(moduleName: string): Promise<any>;

        /**
         * Ensures every module queued at the time of the call is loaded.
         */
        abstract ensureAllLoadedAsync(): Promise<void>;

        static combinePath(src: string, baseUrl: string = '') {
            if (baseUrl.endsWith('/'))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            let result = baseUrl + '/' + (src.startsWith('/') ? src.substr(1) : src);
            return result.startsWith('/') ? result.substr(1) : result;
        }
    }
}
