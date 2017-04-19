/// <reference path="../../../module_loader.ts" />
/// <reference path="../../../task_map.ts" />
/// <reference path="../browser_module_loader.ts" />
/// <reference path="./systemjs_bundle_dependency_policy.ts" />

namespace __sharpangles {
    export class SystemJSModuleLoader extends ModuleLoader<SystemJSModuleLoaderConfig> {
        constructor(private _browserModuleLoader: BrowserModuleLoader, dependencyPolicy: SystemJSBundleDependencyPolicy, private _baseUrl: string = '/', useDefaultOnBasePaths = true) {
            super();
             if (this._baseUrl != '/')
                dependencyPolicy.localCodePaths.push(this._baseUrl.startsWith('/') ? this._baseUrl.substr(1) : this._baseUrl);

           var initialConfig = {
                packages: <any>{},
                baseURL: this._baseUrl,
                paths: {
                    'npm:': '/' + this._browserModuleLoader.combinePath('node_modules/', this._baseUrl)
                }
            };
            if (useDefaultOnBasePaths) {
                for (var codePath of dependencyPolicy.localCodePaths)
                    initialConfig.packages['/' + codePath] = { defaultExtension: 'js' };
            }
            System.config(initialConfig);
        }

        private _taskMap = new TaskMap<string, string, any>((key: string, source: string) => new Task<any>(() => System.import(key)));

        loadModuleAsync(moduleName: string): Promise<any> {
            return this._taskMap.ensureOrCreateAsync(moduleName, moduleName);
        }

        async ensureAllLoadedAsync(): Promise<void> {
            await Promise.all([this._browserModuleLoader.ensureAllLoadedAsync(), this._taskMap.ensureAllAsync()]);
        }

        registerDependencies(dependencies: { [key: string]: Dependency<SystemJSModuleLoaderConfig> }) {
            var config = {
                map: <{ [key: string]: string }>{},
                packages: <{ [key: string]: { defaultExtension: string | boolean, main: string } }>{},
                paths: {}
            };
            for (var dep of Object.keys(dependencies).map(k => dependencies[k]))
                this._registerDependencyOnConfig(dep, config);
            System.config(config);
        }

        private _registerDependencyOnConfig(dependency: Dependency<SystemJSModuleLoaderConfig>, config: any) {
            if (!dependency.moduleLoaderConfig)
                return;
            if (dependency.moduleLoaderConfig.useTag)
                this._browserModuleLoader.loadModuleAsync(this._browserModuleLoader.combinePath(dependency.moduleLoaderConfig.useTag, this._baseUrl));
            if (dependency.moduleLoaderConfig.systemConfig)
                System.config(dependency.moduleLoaderConfig.systemConfig);
            if (dependency.moduleLoaderConfig.systemPackageConfig) {
                for (var key of Object.keys(dependency.moduleLoaderConfig.systemPackageConfig)) {
                    if (!config.packages[dependency.name])
                        config.packages[dependency.name] = {};
                    config.packages[dependency.name][key] = (<any>dependency.moduleLoaderConfig.systemPackageConfig)[key];
                }
            }
        }
    }
}
