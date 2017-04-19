/// <reference path="./ScriptTagLoader.ts" />

namespace __sharpangles {
    interface _polyfillTest {
        src: string;
        test(): boolean;
    }

    export class Polyfiller {
        constructor(public baseUrl: string) {
        }

        fromES5(): Polyfiller {
            this.registerPolyfill("node_modules/core-js/client/shim.min.js", () => typeof Reflect === "undefined" || !(<any>Reflect).getMetadata);
            return this;
        }

        withSystemJS(): Polyfiller {
            this.registerPolyfill("node_modules/systemjs/dist/system.src.js", () => typeof System == "undefined");
            return this;
        }

        registerPolyfill(src: string, test: () => boolean) {
            this._tests.push({ src: src, test: test });
        }

        private _tests: _polyfillTest[] = [];

        async ensurePolyfillsAsync() {
            for (var test of this._tests) {
                if (test.test())
                    scriptTagLoader.loadAsync(test.src, this.baseUrl);
            }
            this._tests = [];
            await scriptTagLoader.ensureLoadedAsync();
        }
    }
}
