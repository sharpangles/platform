/// <reference path="../../module_loader.ts" />

namespace __sharpangles {
    export class CommonJSModuleLoader extends ModuleLoader<any> {
        /**
         *
         * @param tsconfigPaths If provided, the 'paths' option will be aggregated across the tsconfig paths to remap node modules.
         * @param baseUrl The base url for any relative paths provided as well as the
         */
        constructor(tsconfigPaths?: string[], baseUrl?: string) {
            super();
            if (!tsconfigPaths || tsconfigPaths.length === 0) {
                return;
            }
            baseUrl = baseUrl || process.cwd();
            const path = require('path');
            let paths: { [ key: string ]: string[] } = {};
            for (let tsconfigPath in tsconfigPaths) {
                let tsconfig = require(path.isAbsolute(tsconfigPath) ? tsconfigPath : path.resolve(baseUrl, tsconfigPath));
                let tsconfigPathSettings = tsconfig && tsconfig.compilerOptions && tsconfig.compilerOptions.paths;
                if (!tsconfigPathSettings) {
                    continue;
                }
                for (let attrname in tsconfigPathSettings) {
                    // For each path in the tsconfig, push its unique values in the array onto a new or existing array for that module.
                    let existing: string[] = paths.hasOwnProperty(attrname) ? paths[attrname] : (paths[attrname] = []);
                    existing = existing.concat(tsconfigPathSettings[attrname]).filter((val, ind, self) => self.indexOf(val) === ind);
                    paths[attrname] = tsconfigPathSettings[attrname];
                }
            }
            require('tsconfig-paths').register({ baseUrl, paths: paths });
        }

        loadModuleAsync(moduleName: string): Promise<any> {
            return Promise.resolve(require(moduleName));
        }

        ensureAllLoadedAsync(): Promise<any> {
            return Promise.resolve();
        }

        registerDependencies(dependencies: { [key: string]: Dependency<any> }): void {
        }
    }
}
