/// <reference path="./module_loader.ts" />

namespace __sharpangles {
    interface Polyfill {
        dependsOn?: string[];

        /** True to wait for this polyfill before any others start. */
        waitFor?: boolean;

        /** A test to determine if the polyfill is needed or already loaded. */
        test(): boolean;
    }

    export class Polyfiller {
        constructor(private _moduleLoader: ModuleLoader<any>, public baseUrl: string) {
        }

        ensureAllAsync() {
            return this._taskMap.ensureAllAsync();
        }

        private _taskMap = new TaskMap<string, Polyfill, any>((key: string, source: Polyfill) => new Task<any>(() => this._loadPolyfillAsync(key, source)));

        private async _loadPolyfillAsync(key: string, source: Polyfill) {
            await this._taskMap.ensureAllAsync(s => !!s.waitFor);
            if (source.dependsOn) {
                await Promise.all(source.dependsOn.map(d => this._taskMap.ensureAsync(d)));
            }
            if (!source.test())
                return;
            return await this._moduleLoader.loadModuleAsync(key);
        }

        registerPolyfill(src: string, test?: () => boolean, dependsOn?: string[], waitFor?: boolean) {
            this._taskMap.ensureOrCreateAsync(src, { test: test ? test : () => true, dependsOn: dependsOn, waitFor: waitFor });
        }
    }
}
