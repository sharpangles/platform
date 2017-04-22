/// <reference path="../../../module_loader.ts" />
/// <reference path="../../../task_map.ts" />
/// <reference path="../browser_module_loader.ts" />
/// <reference path="./systemjs_module_loader_config.ts" />

namespace __sharpangles {
    export class SystemJSModuleLoader extends ModuleLoader<SystemJSModuleLoaderConfig> {
        constructor(private _browserModuleLoader: BrowserModuleLoader) {
            super();
        }

        private _taskMap = new TaskMap<string, void, void>((key: string) => new Task<void>(() => System.import(key)));

        loadModuleAsync(moduleName: string): Promise<any> {
            return this._taskMap.ensureOrCreateAsync(moduleName, undefined);
        }

        async ensureAllLoadedAsync(): Promise<void> {
            await Promise.all([this._browserModuleLoader.ensureAllLoadedAsync(), this._taskMap.ensureAllAsync()]);
        }

        registerDependency(dependency: Dependency<SystemJSModuleLoaderConfig>) {
            if (!dependency.moduleLoaderConfig)
                return;
            if (dependency.moduleLoaderConfig.browserLoaderConfig) {
                let dep = <Dependency<BrowserModuleLoaderConfig>>{
                    name: dependency.name,
                    knownDependencies: dependency.knownDependencies,
                    dependencies: dependency.dependencies,
                    moduleLoaderConfig: dependency.moduleLoaderConfig.browserLoaderConfig
                };
                this._browserModuleLoader.registerDependency(dep);
                this._browserModuleLoader.loadModuleAsync(dependency.moduleLoaderConfig.browserLoaderConfig.src);
            }
            if (dependency.moduleLoaderConfig.systemConfig)
                System.config(dependency.moduleLoaderConfig.systemConfig);
            let config = { map: <{ [key: string]: string }>{}, packages: <{ [key: string]: any }>{}, paths: {} };
            if (dependency.moduleLoaderConfig.systemPackageConfig) {
                if (!dependency.name)
                    throw new Error('Package configs require a name');
                for (let key of Object.keys(dependency.moduleLoaderConfig.systemPackageConfig)) {
                    if (!config.packages[dependency.name])
                        config.packages[dependency.name] = {};
                    config.packages[dependency.name][key] = (<any>dependency.moduleLoaderConfig.systemPackageConfig)[key];
                }
            }
            System.config(config);
        }
    }
}
