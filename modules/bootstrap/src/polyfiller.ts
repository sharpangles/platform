/// <reference path="./module_loader.ts" />

namespace __sharpangles {
    interface _polyfill {
        dependsOn?: string[];

        /** A test to determine if the polyfill is needed or already loaded. */
        test(): boolean;
    }

    export class Polyfiller {
        constructor(private _moduleLoader: ModuleLoader<any>, public baseUrl: string) {
        }

        ensureAllAsync() {
            return this._taskMap.ensureAllAsync();
        }

        fromES5(): Polyfiller {
            this.registerPolyfill("node_modules/core-js/client/shim.min.js", () => typeof Reflect === "undefined" || !(<any>Reflect).getMetadata);
            return this;
        }

        private _taskMap = new TaskMap<string, _polyfill, any>((key: string, source: _polyfill) => new Task<any>(() => this._loadPolyfillAsync(key, source)));

        private async _loadPolyfillAsync(key: string, source: _polyfill) {
            if (source.dependsOn) {
                await Promise.all(source.dependsOn.map(d => this._taskMap.ensureAsync(d)));
            }
            if (!source.test())
                return;
            return await this._moduleLoader.loadModuleAsync(key);
        }

        registerPolyfill(src: string, test?: () => boolean, dependsOn?: string[]) {
            this._taskMap.ensureOrCreateAsync(src, { test: test ? test : () => true, dependsOn: dependsOn });
        }
    }
}
