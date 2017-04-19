/// <reference path="../../module_loader.ts" />
/// <reference path="../../task_map.ts" />
/// <reference path="../../__sharpangles.ts" />

namespace __sharpangles {
    /**
     * Loads scripts via script tags.
     * For now, this means es5 global scripts.
     */
    export class BrowserModuleLoader extends ModuleLoader<any> {
        constructor(private _baseUrl: string) {
            super();
        }

        private _taskMap = new TaskMap<string, string, boolean>((key: string, source: string) => this._createTagTask(key));

        async loadModuleAsync(moduleName: string): Promise<any> {
            moduleName = this.combinePath(moduleName, this._baseUrl);
            await this._taskMap.ensureOrCreateAsync(moduleName, moduleName);
        }

        combinePath(src: string, baseUrl: string = '') {
            if (baseUrl.endsWith('/'))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            var result = baseUrl + "/" + (src.startsWith('/') ? src.substr(1) : src);
            return result.startsWith('/') ? result.substr(1) : result;
        }

        /**
         * Gets all script tags currently loaded
         */
        async ensureAllLoadedAsync(): Promise<void> {
            return this._taskMap.ensureAllAsync();
        }

        private _createTagTask(moduleName: string) {
            return new Task<boolean>(() => new Promise<boolean>(resolve => {
                let el = document.createElement("script");
                el.setAttribute("src", moduleName);
                el.setAttribute("type", "text/javascript"); // @todo application/javascript, module?
                el.setAttribute("async", "false");
                var resolved = false;
                el.onerror = (event) => {
                    console.log(`failed to load ${moduleName}.`);
                    if (!resolved) {
                        resolved = true;
                        resolve(false);
                    }
                }
                el.onload = (event) => {
                    if (!resolved) {
                        resolved = true;
                        resolve(true);
                    }
                }
                document.head.appendChild(el);
            }));
        }
    }
}
