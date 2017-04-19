namespace __sharpangles {
    export class ScriptTagLoader {
        private _loads = new Map<string, Promise<any>>();

        /**
         * Gets all script tags currently loaded
         */
        ensureLoadedAsync() {
            return Promise.all(Array.from(this._loads.values()));
        }

        combinePath(src: string, baseUrl: string = '') {
            if (baseUrl.endsWith('/'))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            var result = baseUrl + "/" + (src.startsWith('/') ? src.substr(1) : src);
            return result.startsWith('/') ? result.substr(1) : result;
        }

        loadAsync(src: string, baseUrl?: string) {
            src = this.combinePath(src, baseUrl);
            if (this._loads.has(src))
                return this._loads.get(src);
            var promise = new Promise<boolean>(resolve => {
                let el = document.createElement("script");
                el.setAttribute("src", src);
                el.setAttribute("type", "text/javascript");
                el.setAttribute("async", "false");
                var resolved = false;
                el.onerror = (event) => {
                    console.log("failed to load " + src);
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
            });
            this._loads.set(src, promise);
            return promise;
        }
    }

    export var scriptTagLoader = new ScriptTagLoader();
}
