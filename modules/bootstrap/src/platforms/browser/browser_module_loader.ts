/// <reference path="../../module_loader.ts" />
/// <reference path="../../task_map.ts" />
/// <reference path="./browser_module_loader_config.ts" />

namespace __sharpangles {
    /**
     * Loads scripts via script tags.
     * For now, this means es5 global scripts.
     */
    export class BrowserModuleLoader extends ModuleLoader<BrowserModuleLoaderConfig> {
        constructor(private _baseUrl?: string) {
            super();
        }

        private _taskMap = new TaskMap<string, void, void>((key: string) => new Task<void>(() => this._createTagAsync(key)));
        private _knownDependencies = new Map<string, Dependency<BrowserModuleLoaderConfig>>();

        registerDependency(dependency: Dependency<BrowserModuleLoaderConfig>): void {
            this._knownDependencies.set(dependency.name || '', dependency);
        }

        async loadModuleAsync(moduleName: string): Promise<any> {
            moduleName = ModuleLoader.combinePath(moduleName, this._baseUrl);
            await this._taskMap.ensureOrCreateAsync(moduleName, undefined);
        }

        /**
         * Gets all script tags currently loaded
         */
        async ensureAllLoadedAsync(): Promise<void> {
            return this._taskMap.ensureAllAsync();
        }

        private _createTagAsync(moduleName: string) {
            let dep = this._knownDependencies.get(moduleName);
            let config = dep && dep.moduleLoaderConfig || { src: moduleName };
            return new Promise<void>((resolve, reject) => {
                let el = document.createElement('script');
                el.setAttribute('src', config.src);
                el.setAttribute('type', config.isModule ? 'module' : 'application/javascript');
                if (config.isAsync)
                    el.setAttribute('async', 'true');
                if (config.isDeferred)
                    el.setAttribute('defer', 'true');
                el.onerror = (event) => {
                    reject(event.error);
                };
                el.onload = (event) => {
                    resolve();
                };
                document.head.appendChild(el);
            });
        }
    }
}
